import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logAnalyticsEvent } from '@/lib/analytics-events';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.enum(['popup', 'inline', 'exit_intent']),
  leadMagnet: z.string().optional(),
  timestamp: z.string()
});

// Simple in-memory store for demo - replace with database in production
const emailSubscribers = new Map();

// Mailchimp API configuration
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // e.g., 'us17'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);
    
    const { email, source, leadMagnet, timestamp } = validatedData;

    // Check for duplicate signups
    if (emailSubscribers.has(email)) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      );
    }

    // Add to Mailchimp if configured
    let mailchimpSuccess = false;
    if (MAILCHIMP_API_KEY && MAILCHIMP_AUDIENCE_ID && MAILCHIMP_SERVER_PREFIX) {
      try {
        const mailchimpResponse = await fetch(
          `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
          {
            method: 'POST',
            headers: {
              'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email_address: email,
              status: 'subscribed',
              merge_fields: {
                SOURCE: source,
                LEADMAGNET: leadMagnet || 'contractor_checklist',
                DISCOUNT: '20'
              },
              tags: ['contractor_checklist', 'quote_evaluator', '20_percent_off']
            }),
          }
        );

        if (mailchimpResponse.ok) {
          mailchimpSuccess = true;
          console.log('Successfully added to Mailchimp:', email);
        } else {
          const errorData = await mailchimpResponse.json();
          console.error('Mailchimp error:', errorData);
        }
      } catch (mailchimpError) {
        console.error('Mailchimp API error:', mailchimpError);
      }
    }

    // Store locally for fallback
    const subscriberData = {
      email,
      source,
      leadMagnet,
      timestamp,
      subscribed: true,
      discountPercent: 20,
      discountExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      automationStage: 0, // Track email sequence progress
      lastEmailSent: null
    };
    
    emailSubscribers.set(email, subscriberData);

    await logAnalyticsEvent({
      type: 'email_signup',
      email,
      metadata: { source, leadMagnet: leadMagnet || 'contractor_checklist' },
    });

    // Trigger the first email in the automated sequence
    await triggerWelcomeEmail(email, source);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed',
      discountPercent: 20,
      checklistUrl: '/api/contractor-checklist', // URL to download checklist
      mailchimpSuccess
    });

  } catch (error) {
    console.error('Email signup error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Function to trigger the welcome email (Email 1 in sequence)
async function triggerWelcomeEmail(email: string, source: string) {
  try {
    // In production, this would trigger your email service
    // For now, we'll simulate with a scheduled job
    
    // Email service integration would go here
    const checklistUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/contractor-checklist`;

    // Update automation stage
    const subscriber = emailSubscribers.get(email);
    if (subscriber) {
      subscriber.automationStage = 1;
      subscriber.lastEmailSent = new Date().toISOString();
      emailSubscribers.set(email, subscriber);
    }

    console.log('Welcome email triggered for:', email);
    
    // Schedule follow-up emails
    setTimeout(() => scheduleFollowUpEmails(email), 1000);
    
  } catch (error) {
    console.error('Welcome email trigger error:', error);
  }
}

// Schedule the 3-email sequence
async function scheduleFollowUpEmails(email: string) {
  // Email 2: Case study (24 hours later)
  setTimeout(() => {
    triggerCaseStudyEmail(email);
  }, 24 * 60 * 60 * 1000); // 24 hours

  // Email 3: Final discount reminder (72 hours later)
  setTimeout(() => {
    triggerFinalDiscountEmail(email);
  }, 72 * 60 * 60 * 1000); // 72 hours
}

async function triggerCaseStudyEmail(email: string) {
  const subscriber = emailSubscribers.get(email);
  if (!subscriber || !subscriber.subscribed) return;

  // In production, send actual email via your email service
  console.log('Case study email triggered for:', email);
  
  subscriber.automationStage = 2;
  subscriber.lastEmailSent = new Date().toISOString();
  emailSubscribers.set(email, subscriber);
}

async function triggerFinalDiscountEmail(email: string) {
  const subscriber = emailSubscribers.get(email);
  if (!subscriber || !subscriber.subscribed) return;

  // In production, send actual email via your email service
  console.log('Final discount email triggered for:', email);
  
  subscriber.automationStage = 3;
  subscriber.lastEmailSent = new Date().toISOString();
  emailSubscribers.set(email, subscriber);
}

export async function GET(request: NextRequest) {
  // Admin endpoint to view subscribers (add auth in production)
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  if (action === 'stats') {
    const stats = {
      totalSubscribers: emailSubscribers.size,
      bySource: {} as Record<string, number>,
      automationStages: { 0: 0, 1: 0, 2: 0, 3: 0 } as Record<number, number>
    };
    
    for (const [_email, data] of emailSubscribers) {
      // Count by source
      if (!stats.bySource[data.source]) {
        stats.bySource[data.source] = 0;
      }
      stats.bySource[data.source]++;
      
      // Count by automation stage
      stats.automationStages[data.automationStage]++;
    }
    
    return NextResponse.json(stats);
  }
  
  return NextResponse.json({ 
    message: 'Email signup API',
    totalSubscribers: emailSubscribers.size 
  });
}