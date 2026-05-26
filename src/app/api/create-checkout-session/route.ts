import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createCheckoutSchema } from '@/lib/validation';
import { z } from 'zod';

// Map product types to Stripe price IDs (replace with your actual price IDs from Stripe dashboard)
const PRODUCT_PRICE_IDS = {
  single: 'price_1RoyC2GzTvAw50xvEBJva56n', // Single Quote $4.99 - Production Price ID
  subscription: 'price_1RoyCWGzTvAw50xvdBQrWrJw', // Pro Subscription $9.99/month - Production Price ID
  repeat: 'price_repeat_analysis_4_99', // Repeat Analysis $4.99 - Placeholder, need actual Stripe ID
  proplus: 'price_1TLPIRGzTvAw50xvH8KeUNkZ', // Pro+ $9.99/month subscription
  lifetime: 'price_1TLPIiGzTvAw50xvaIrSnf1J', // Lifetime Access $29.99 one-time
};

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });
  try {
    const body = await request.json();
    
    // Validate input
    let validatedData;
    try {
      validatedData = createCheckoutSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
    
    const { priceId, mode = 'payment', quoteId, productType } = validatedData;

    // Determine the correct price/product
    let stripePriceId = priceId;
    if (!stripePriceId) {
      if (productType && PRODUCT_PRICE_IDS[productType as keyof typeof PRODUCT_PRICE_IDS]) {
        stripePriceId = PRODUCT_PRICE_IDS[productType as keyof typeof PRODUCT_PRICE_IDS];
      } else {
        stripePriceId = mode === 'subscription' ? PRODUCT_PRICE_IDS.subscription : PRODUCT_PRICE_IDS.single;
      }
    }

    // Adjust mode based on product type
    let checkoutMode = mode;
    if (productType === 'subscription' || productType === 'proplus') {
      checkoutMode = 'subscription';
    } else if (productType === 'lifetime') {
      checkoutMode = 'payment';
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: checkoutMode,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}${quoteId ? `&quote_id=${quoteId}` : ''}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      metadata: {
        quote_id: quoteId || '',
        product_type: productType || (checkoutMode === 'subscription' ? 'pro_subscription' : 'pro_analysis'),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 