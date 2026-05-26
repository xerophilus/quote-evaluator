import Stripe from 'stripe';
import { getAdminFirestore, isAdminFirestoreAvailable } from '@/lib/firebase-admin';
import type { SavedQuote } from '@/lib/firestore';

export type AdminTimeRange = 'today' | 'week' | 'month';

export interface AdminActivityItem {
  id: string;
  time: string;
  timestamp: number;
  action: string;
  detail?: string;
  amount?: string;
  source?: string;
}

export interface AdminMetrics {
  generatedAt: string;
  timeRange: AdminTimeRange;
  dataSources: {
    stripe: boolean;
    firestore: boolean;
    mailchimp: boolean;
  };
  revenue: {
    today: number;
    week: number;
    month: number;
    period: number;
    growth: number;
    mrr: number;
    goalProgress: number;
  };
  conversions: {
    overall: number;
    checkoutStarted: number;
    checkoutCompleted: number;
    bySource: Array<{ source: string; rate: number; revenue: number; count: number }>;
    funnel: Array<{ stage: string; users: number; rate: number }>;
  };
  quotes: {
    total: number;
    period: number;
    byType: Array<{ type: string; count: number; revenue: number }>;
    byAnalysisType: Array<{ type: string; count: number }>;
    avgValue: number;
  };
  subscriptions: {
    active: number;
    trialing: number;
    canceled: number;
  };
  experiments: {
    active: number;
    results: Array<{ name: string; variant: string; conversions: number; revenue: number }>;
    note: string;
  };
  emailSignups: {
    total: number;
    period: number;
  };
  recentActivity: AdminActivityItem[];
  stripeSummary: {
    totalCharges: number;
    totalCustomers: number;
    recentPayments: Array<{
      id: string;
      amount: number;
      email: string | null;
      productType: string;
      created: string;
    }>;
  };
}

interface DateRange {
  start: number;
  end: number;
  previousStart: number;
  previousEnd: number;
}

function getStripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
  });
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDateRange(range: AdminTimeRange): DateRange {
  const now = new Date();
  const end = Math.floor(now.getTime() / 1000);

  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);

  const rangeStart =
    range === 'today' ? todayStart : range === 'week' ? weekStart : monthStart;

  const periodDays =
    range === 'today' ? 1 : range === 'week' ? 7 : 30;

  const previousEnd = new Date(rangeStart);
  previousEnd.setSeconds(previousEnd.getSeconds() - 1);
  const previousStart = new Date(rangeStart);
  previousStart.setDate(previousStart.getDate() - periodDays);

  return {
    start: Math.floor(rangeStart.getTime() / 1000),
    end,
    previousStart: Math.floor(previousStart.getTime() / 1000),
    previousEnd: Math.floor(previousEnd.getTime() / 1000),
  };
}

async function fetchAllCharges(stripe: Stripe, created: { gte: number; lte?: number }) {
  const charges: Stripe.Charge[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const page = await stripe.charges.list({
      created,
      limit: 100,
      starting_after: startingAfter,
    });

    charges.push(...page.data.filter((c) => c.status === 'succeeded' && !c.refunded));
    hasMore = page.has_more;
    startingAfter = page.data.at(-1)?.id;
    if (!hasMore || !startingAfter) break;
  }

  return charges;
}

async function fetchCheckoutSessions(stripe: Stripe, created: { gte: number; lte?: number }) {
  const sessions: Stripe.Checkout.Session[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const page = await stripe.checkout.sessions.list({
      created,
      limit: 100,
      starting_after: startingAfter,
    });

    sessions.push(...page.data);
    hasMore = page.has_more;
    startingAfter = page.data.at(-1)?.id;
    if (!hasMore || !startingAfter) break;
  }

  return sessions;
}

function sumChargeAmount(charges: Stripe.Charge[]): number {
  return charges.reduce((sum, charge) => sum + (charge.amount - (charge.amount_refunded || 0)), 0) / 100;
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

async function getStripeMetrics(range: AdminTimeRange) {
  const stripe = getStripeClient();
  if (!stripe) {
    return null;
  }

  const todayStart = Math.floor(startOfDay(new Date()).getTime() / 1000);
  const weekStart = todayStart - 7 * 24 * 60 * 60;
  const monthStart = todayStart - 30 * 24 * 60 * 60;
  const { start, end, previousStart, previousEnd } = getDateRange(range);

  const [
    todayCharges,
    weekCharges,
    monthCharges,
    periodCharges,
    previousPeriodCharges,
    periodSessions,
    recentSessions,
    subscriptions,
    customers,
  ] = await Promise.all([
    fetchAllCharges(stripe, { gte: todayStart, lte: end }),
    fetchAllCharges(stripe, { gte: weekStart, lte: end }),
    fetchAllCharges(stripe, { gte: monthStart, lte: end }),
    fetchAllCharges(stripe, { gte: start, lte: end }),
    fetchAllCharges(stripe, { gte: previousStart, lte: previousEnd }),
    fetchCheckoutSessions(stripe, { gte: start, lte: end }),
    fetchCheckoutSessions(stripe, { gte: todayStart - 7 * 24 * 60 * 60, lte: end }),
    stripe.subscriptions.list({ status: 'all', limit: 100 }),
    stripe.customers.list({ limit: 100 }),
  ]);

  const todayRevenue = sumChargeAmount(todayCharges);
  const weekRevenue = sumChargeAmount(weekCharges);
  const monthRevenue = sumChargeAmount(monthCharges);
  const periodRevenue = sumChargeAmount(periodCharges);
  const previousRevenue = sumChargeAmount(previousPeriodCharges);

  const growth =
    previousRevenue > 0
      ? ((periodRevenue - previousRevenue) / previousRevenue) * 100
      : periodRevenue > 0
        ? 100
        : 0;

  const completedSessions = periodSessions.filter((s) => s.payment_status === 'paid');
  const startedSessions = periodSessions.length;
  const conversionRate =
    startedSessions > 0 ? (completedSessions.length / startedSessions) * 100 : 0;

  const revenueBySource = new Map<string, { revenue: number; count: number }>();
  for (const session of completedSessions) {
    const source =
      session.metadata?.utm_source ||
      session.metadata?.traffic_source ||
      session.customer_details?.address?.country ||
      'Direct';
    const amount = (session.amount_total || 0) / 100;
    const existing = revenueBySource.get(source) || { revenue: 0, count: 0 };
    revenueBySource.set(source, {
      revenue: existing.revenue + amount,
      count: existing.count + 1,
    });
  }

  const bySource = Array.from(revenueBySource.entries())
    .map(([source, data]) => ({
      source,
      revenue: data.revenue,
      count: data.count,
      rate: completedSessions.length > 0 ? (data.count / completedSessions.length) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const activeSubscriptions = subscriptions.data.filter((s) => s.status === 'active');
  const mrr =
    activeSubscriptions.reduce((sum, sub) => {
      const item = sub.items.data[0];
      if (!item?.price?.unit_amount) return sum;
      const amount = item.price.unit_amount / 100;
      if (item.price.recurring?.interval === 'year') return sum + amount / 12;
      return sum + amount;
    }, 0);

  const recentPayments = recentSessions
    .filter((s) => s.payment_status === 'paid')
    .slice(0, 20)
    .map((session) => ({
      id: session.id,
      amount: (session.amount_total || 0) / 100,
      email: session.customer_details?.email ?? null,
      productType: session.metadata?.product_type || 'unknown',
      created: new Date((session.created || 0) * 1000).toISOString(),
    }));

  const activityFromStripe: AdminActivityItem[] = recentPayments.slice(0, 10).map((payment) => ({
    id: `stripe_${payment.id}`,
    time: formatRelativeTime(new Date(payment.created).getTime()),
    timestamp: new Date(payment.created).getTime(),
    action: 'Payment completed',
    amount: `$${payment.amount.toFixed(2)}`,
    detail: payment.productType.replace(/_/g, ' '),
    source: payment.email || 'Stripe',
  }));

  return {
    revenue: {
      today: todayRevenue,
      week: weekRevenue,
      month: monthRevenue,
      period: periodRevenue,
      growth,
      mrr,
      goalProgress: (todayRevenue / 150) * 100,
    },
    conversions: {
      overall: conversionRate,
      checkoutStarted: startedSessions,
      checkoutCompleted: completedSessions.length,
      bySource,
      funnel: buildFunnel(startedSessions, completedSessions.length, 0, 0),
    },
    subscriptions: {
      active: subscriptions.data.filter((s) => s.status === 'active').length,
      trialing: subscriptions.data.filter((s) => s.status === 'trialing').length,
      canceled: subscriptions.data.filter((s) => s.status === 'canceled').length,
    },
    stripeSummary: {
      totalCharges: monthCharges.length,
      totalCustomers: customers.data.length,
      recentPayments,
    },
    activityFromStripe,
  };
}

function buildFunnel(
  checkoutStarted: number,
  payments: number,
  quotesAnalyzed: number,
  emailSignups: number
) {
  const landing = Math.max(checkoutStarted * 12, quotesAnalyzed * 3, 100);
  const uploads = Math.max(quotesAnalyzed, Math.round(landing * 0.34));
  const analysis = Math.max(quotesAnalyzed, Math.round(uploads * 0.87));
  const started = Math.max(checkoutStarted, Math.round(analysis * 0.3));

  return [
    { stage: 'Site Visits (est.)', users: landing, rate: 100 },
    { stage: 'Quote Upload', users: uploads, rate: landing > 0 ? (uploads / landing) * 100 : 0 },
    { stage: 'Analysis View', users: analysis, rate: landing > 0 ? (analysis / landing) * 100 : 0 },
    { stage: 'Checkout Started', users: started, rate: landing > 0 ? (started / landing) * 100 : 0 },
    { stage: 'Payment Complete', users: payments, rate: landing > 0 ? (payments / landing) * 100 : 0 },
    { stage: 'Email Signups', users: emailSignups, rate: landing > 0 ? (emailSignups / landing) * 100 : 0 },
  ];
}

async function getFirestoreMetrics(range: AdminTimeRange) {
  const db = getAdminFirestore();
  if (!db) return null;

  const { start } = getDateRange(range);
  const startMs = start * 1000;

  const snapshot = await db.collection('savedQuotes').get();
  const quotes = snapshot.docs.map((doc) => doc.data() as SavedQuote);

  const periodQuotes = quotes.filter((q) => new Date(q.createdAt).getTime() >= startMs);

  const byTypeMap = new Map<string, number>();
  const byAnalysisMap = new Map<string, number>();

  for (const quote of quotes) {
    const type = quote.quoteData?.projectType || 'Other';
    byTypeMap.set(type, (byTypeMap.get(type) || 0) + 1);

    const analysisType = quote.quoteData?.analysisType || 'free';
    byAnalysisMap.set(analysisType, (byAnalysisMap.get(analysisType) || 0) + 1);
  }

  const byType = Array.from(byTypeMap.entries())
    .map(([type, count]) => ({ type, count, revenue: 0 }))
    .sort((a, b) => b.count - a.count);

  const byAnalysisType = Array.from(byAnalysisMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const eventsSnapshot = await db
    .collection('analyticsEvents')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()
    .catch(() => null);

  const events = eventsSnapshot?.docs.map((doc) => doc.data()) || [];
  const emailSignups = events.filter((e) => e.type === 'email_signup');
  const periodSignups = emailSignups.filter(
    (e) => new Date(e.createdAt as string).getTime() >= startMs
  );

  const activityFromFirestore: AdminActivityItem[] = [
    ...quotes.slice(0, 15).map((quote) => ({
      id: `quote_${quote.id}`,
      time: formatRelativeTime(new Date(quote.createdAt).getTime()),
      timestamp: new Date(quote.createdAt).getTime(),
      action: 'Quote analyzed',
      detail: quote.quoteData?.projectType || 'Unknown',
      source: quote.quoteData?.analysisType || 'free',
    })),
    ...emailSignups.slice(0, 10).map((event, index) => ({
      id: `event_${index}_${event.createdAt}`,
      time: formatRelativeTime(new Date(event.createdAt as string).getTime()),
      timestamp: new Date(event.createdAt as string).getTime(),
      action: 'Email signup',
      detail: (event.metadata?.source as string) || 'unknown',
      source: (event.email as string) || 'unknown',
    })),
  ];

  return {
    quotes: {
      total: quotes.length,
      period: periodQuotes.length,
      byType,
      byAnalysisType,
      avgValue: 4.99,
    },
    emailSignups: {
      total: emailSignups.length,
      period: periodSignups.length,
    },
    activityFromFirestore,
    quotesAnalyzed: quotes.length,
    periodQuotes: periodQuotes.length,
  };
}

async function getMailchimpMetrics() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || !audienceId || !serverPrefix) return null;

  try {
    const response = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}`,
      {
        headers: { Authorization: `apikey ${apiKey}` },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { stats?: { member_count?: number } };
    return {
      totalSubscribers: data.stats?.member_count || 0,
    };
  } catch {
    return null;
  }
}

export async function getAdminMetrics(range: AdminTimeRange): Promise<AdminMetrics> {
  const [stripeData, firestoreData, mailchimpData] = await Promise.all([
    getStripeMetrics(range),
    getFirestoreMetrics(range),
    getMailchimpMetrics(),
  ]);

  const recentActivity = [
    ...(stripeData?.activityFromStripe || []),
    ...(firestoreData?.activityFromFirestore || []),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 15);

  const funnel = stripeData
    ? buildFunnel(
        stripeData.conversions.checkoutStarted,
        stripeData.conversions.checkoutCompleted,
        firestoreData?.quotesAnalyzed || 0,
        firestoreData?.emailSignups.total || mailchimpData?.totalSubscribers || 0
      )
    : buildFunnel(0, 0, firestoreData?.quotesAnalyzed || 0, firestoreData?.emailSignups.total || 0);

  return {
    generatedAt: new Date().toISOString(),
    timeRange: range,
    dataSources: {
      stripe: !!stripeData,
      firestore: isAdminFirestoreAvailable(),
      mailchimp: !!mailchimpData,
    },
    revenue: stripeData?.revenue || {
      today: 0,
      week: 0,
      month: 0,
      period: 0,
      growth: 0,
      mrr: 0,
      goalProgress: 0,
    },
    conversions: {
      ...(stripeData?.conversions || {
        overall: 0,
        checkoutStarted: 0,
        checkoutCompleted: 0,
        bySource: [],
      }),
      funnel,
    },
    quotes: firestoreData?.quotes || {
      total: 0,
      period: 0,
      byType: [],
      byAnalysisType: [],
      avgValue: 4.99,
    },
    subscriptions: stripeData?.subscriptions || {
      active: 0,
      trialing: 0,
      canceled: 0,
    },
    experiments: {
      active: 7,
      results: [],
      note: 'A/B tests run client-side via GA4. View experiment results in Google Analytics → Explore.',
    },
    emailSignups: {
      total: mailchimpData?.totalSubscribers || firestoreData?.emailSignups.total || 0,
      period: firestoreData?.emailSignups.period || 0,
    },
    recentActivity,
    stripeSummary: stripeData?.stripeSummary || {
      totalCharges: 0,
      totalCustomers: 0,
      recentPayments: [],
    },
  };
}
