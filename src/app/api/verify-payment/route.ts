import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyPaymentSchema } from '@/lib/validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });
  try {
    const body = await request.json();
    
    // Validate input
    let validatedData;
    try {
      validatedData = verifyPaymentSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
    
    const { sessionId } = validatedData;

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if this is a subscription or single payment
    const isSubscription = session.mode === 'subscription';
    
    let subscriptionInfo = null;
    
    if (isSubscription && session.subscription) {
      // Get subscription details if it's a subscription
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      subscriptionInfo = {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: (subscription as unknown as {current_period_start: number}).current_period_start,
        currentPeriodEnd: (subscription as unknown as {current_period_end: number}).current_period_end,
        cancelAtPeriodEnd: (subscription as unknown as {cancel_at_period_end: boolean}).cancel_at_period_end,
      };
    }

    return NextResponse.json({
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email,
      quoteId: session.metadata?.quote_id,
      isSubscription,
      subscriptionInfo,
      customerId: session.customer,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 