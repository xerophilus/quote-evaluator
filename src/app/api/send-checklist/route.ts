import { NextRequest, NextResponse } from 'next/server';

// Dynamic import for Mailchimp (to handle environment where API key might not be available)
let mailchimp: unknown = null;

async function getMailchimpClient() {
  if (!mailchimp && process.env.MAILCHIMP_API_KEY) {
    try {
      // Dynamic import with type assertion to handle missing type definitions
      const mailchimpModule = await import('@mailchimp/mailchimp_transactional');
      mailchimp = mailchimpModule.default(process.env.MAILCHIMP_API_KEY);
    } catch (error) {
      console.error('Failed to load Mailchimp module:', error);
      return null;
    }
  }
  return mailchimp;
}

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log(`📧 New ${type} signup:`, email);

    // Send welcome email with checklist
    let emailSent = false;

    try {
      if (process.env.MAILCHIMP_API_KEY) {
        await sendWelcomeEmail(email);
        emailSent = true;
        console.log(`✅ Checklist email sent to: ${email}`);
      } else {
        console.log('⚠️ Mailchimp API key not configured - skipping email send');
      }
    } catch (error) {
      console.error('❌ Email send failed:', error);
      // Continue anyway - don't break the user flow
    }

    const response = {
      success: true,
      message: emailSent ? 'Checklist sent to your email!' : 'Checklist ready for download!',
      email,
      downloadUrl: '/checklist.html',
      emailSent,
      instructions: emailSent 
        ? 'Check your email for the complete contractor red flags checklist!'
        : 'Download your checklist below - email delivery temporarily unavailable.'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing checklist request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string) {
  const mailchimpClient = await getMailchimpClient();
  if (!mailchimpClient) {
    throw new Error('Mailchimp client not available');
  }

  const emailContent = getEmailTemplate(email);
  
  const message = {
    from_email: process.env.MAILCHIMP_FROM_EMAIL || 'hello@quoteevaluator.com',
    from_name: 'QuoteEvaluator.com',
    to: [
      {
        email: email,
        type: 'to'
      }
    ],
    subject: '🚨 Your FREE Contractor Red Flags Checklist - Avoid $15,000+ Scams!',
    html: emailContent,
    text: getPlainTextVersion(email),
    important: true,
    track_opens: true,
    track_clicks: true,
    auto_text: true,
    auto_html: false,
    inline_css: true
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (mailchimpClient as any).messages.send({ message });
  return response;
}

function getEmailTemplate(email: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://quoteevaluator.com';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Contractor Red Flags Checklist</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .cta-button { display: inline-block; background: #DC2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .checklist-preview { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 20px; margin: 20px 0; }
        .stats { background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #F9FAFB; padding: 20px; text-align: center; color: #6B7280; }
        .highlight { background: #FEF3C7; padding: 2px 6px; border-radius: 4px; color: #92400E; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🚨 Your Contractor Red Flags Checklist</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Protect Yourself from $15,000+ Contractor Scams</p>
        </div>
        
        <div class="content">
            <p>Hi there!</p>
            
            <p>Thank you for signing up with <strong>QuoteEvaluator.com</strong>! As promised, here's your <strong>FREE Contractor Red Flags Checklist</strong> that has already helped thousands of homeowners avoid costly contractor scams.</p>
            
            <div style="text-align: center;">
                <a href="${baseUrl}/checklist.html" class="cta-button">📋 Download Your Checklist Now</a>
            </div>
            
            <div class="stats">
                <h3 style="color: #059669; margin-top: 0;">📊 Real Impact:</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li><strong>$2.3M+</strong> saved by our users from contractor overcharges</li>
                    <li><strong>89%</strong> of users avoid hiring bad contractors</li>
                    <li><strong>Average savings:</strong> $3,200 per project</li>
                    <li><strong>10,000+</strong> homeowners protected</li>
                </ul>
            </div>
            
            <div class="checklist-preview">
                <h3 style="color: #DC2626; margin-top: 0;">🎯 What's Inside Your Checklist:</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li><strong>23 Critical Red Flags</strong> to watch for</li>
                    <li><strong>Real cost examples</strong> ($15K+ scams exposed)</li>
                    <li><strong>8 Essential questions</strong> to ask every contractor</li>
                    <li><strong>Licensing & insurance</strong> verification tips</li>
                    <li><strong>Payment protection</strong> strategies</li>
                    <li><strong>Green flags</strong> to identify trustworthy contractors</li>
                </ul>
            </div>
            
            <h3>⚡ Quick Start Guide:</h3>
            <ol>
                <li><strong>Print the checklist</strong> for easy reference</li>
                <li><strong>Use it for every contractor meeting</strong></li>
                <li><strong>Check off red flags</strong> as you spot them</li>
                <li><strong>Walk away</strong> if you see 3+ red flags</li>
            </ol>
            
            <div style="background: #EBF8FF; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="color: #1E40AF; margin-top: 0;">🚀 Ready to Analyze Your Quote?</h3>
                <p>Get instant AI-powered analysis of any contractor quote with our advanced tool:</p>
                <a href="${baseUrl}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Analyze My Quote Now</a>
            </div>
            
            <p><strong>Pro Tip:</strong> Share this checklist with friends and family. Contractor scams are everywhere, and this simple checklist can save them thousands!</p>
            
            <p>Stay safe out there,<br>
            <strong>The QuoteEvaluator.com Team</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>QuoteEvaluator.com</strong> - Your trusted partner in contractor quote analysis</p>
            <p>This email was sent to ${email} because you requested our contractor red flags checklist.</p>
            <p><a href="${baseUrl}" style="color: #3B82F6;">Visit Website</a> | <a href="#" style="color: #6B7280;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
  `;
}

function getPlainTextVersion(email: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://quoteevaluator.com';
  
  return `
🚨 Your Contractor Red Flags Checklist

Hi there!

Thank you for signing up with QuoteEvaluator.com! Here's your FREE Contractor Red Flags Checklist that has helped thousands avoid costly contractor scams.

📋 Download Your Checklist: ${baseUrl}/checklist.html

📊 Real Impact:
- $2.3M+ saved by our users from contractor overcharges
- 89% of users avoid hiring bad contractors  
- Average savings: $3,200 per project
- 10,000+ homeowners protected

🎯 What's Inside:
- 23 Critical Red Flags to watch for
- Real cost examples ($15K+ scams exposed)
- 8 Essential questions to ask every contractor
- Licensing & insurance verification tips
- Payment protection strategies
- Green flags to identify trustworthy contractors

⚡ Quick Start:
1. Print the checklist for easy reference
2. Use it for every contractor meeting
3. Check off red flags as you spot them  
4. Walk away if you see 3+ red flags

🚀 Ready to analyze your quote? Visit: ${baseUrl}

Stay safe!
The QuoteEvaluator.com Team

--
This email was sent to ${email} because you requested our contractor red flags checklist.
Visit: ${baseUrl} | Unsubscribe: [link]
  `;
}

// TODO: Example email service integration
/*
async function sendWelcomeEmail(email: string, type: string) {
  // Example using SendGrid
  const msg = {
    to: email,
    from: 'hello@quoteevaluator.com',
    subject: '🚨 Your FREE Contractor Red Flags Checklist',
    html: `
      <h2>Welcome to QuoteEvaluator.com!</h2>
      <p>Thanks for signing up! Here's your FREE contractor red flags checklist:</p>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/contractor-red-flags-checklist.pdf" 
         style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
        Download Your Checklist
      </a>
      <p>This comprehensive guide will help you avoid contractor scams and save thousands!</p>
      <hr>
      <p>Ready to analyze your first quote? <a href="${process.env.NEXT_PUBLIC_BASE_URL}">Get started here</a></p>
    `
  };
  
  await sgMail.send(msg);
}
*/