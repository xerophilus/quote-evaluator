import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });
  try {
    let email;
    
    try {
      const body = await request.json();
      email = body.email;
    } catch {
      // Handle empty or invalid JSON body
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Search for customers with this email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        hasActiveSubscription: false,
        subscriptionInfo: null,
      });
    }

    const customer = customers.data[0];

    // Get all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        hasActiveSubscription: false,
        subscriptionInfo: null,
      });
    }

    // Return info about the first active subscription
    const subscription = subscriptions.data[0];
    
    return NextResponse.json({
      hasActiveSubscription: true,
      subscriptionInfo: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: (subscription as unknown as {current_period_start: number}).current_period_start,
        currentPeriodEnd: (subscription as unknown as {current_period_end: number}).current_period_end,
        cancelAtPeriodEnd: (subscription as unknown as {cancel_at_period_end: boolean}).cancel_at_period_end,
      },
      customerEmail: email,
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
} 