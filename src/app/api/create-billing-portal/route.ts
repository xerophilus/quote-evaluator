import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });

  try {
    let email, return_url;
    
    try {
      const body = await request.json();
      email = body.email;
      return_url = body.return_url || 'http://localhost:3000/dashboard';
    } catch {
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

    // Find the customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customers.data[0];

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: return_url,
    });

    return NextResponse.json({
      url: session.url,
    });

      } catch (error: unknown) {
    console.error('Billing portal error:', error);
    
    // Check if this is the configuration error
    if (error && typeof error === 'object' && 'type' in error && 
        error.type === 'StripeInvalidRequestError' && 
        'message' in error && typeof error.message === 'string' &&
        error.message.includes('No configuration provided')) {
      return NextResponse.json(
        { 
          error: 'Stripe billing portal not configured. Please set up the customer portal in your Stripe dashboard.',
          setup_url: 'https://dashboard.stripe.com/test/settings/billing/portal',
          message: 'Go to Stripe Dashboard → Settings → Customer Portal → Activate'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}