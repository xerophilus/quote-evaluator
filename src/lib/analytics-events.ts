import { getAdminFirestore } from '@/lib/firebase-admin';

export interface AnalyticsEvent {
  type: 'email_signup' | 'payment_complete' | 'quote_analyzed' | 'checkout_started';
  email?: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
}

export async function logAnalyticsEvent(
  event: Omit<AnalyticsEvent, 'createdAt'>
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) return;

  try {
    await db.collection('analyticsEvents').add({
      ...event,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log analytics event:', error);
  }
}
