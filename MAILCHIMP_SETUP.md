# Mailchimp Integration Setup Guide

## Overview
This guide walks you through setting up Mailchimp to automatically send the contractor red flags checklist to users who sign up for free quote analysis.

## Prerequisites
- Mailchimp account (free tier works fine)
- Access to your hosting platform's environment variables

## Step 1: Get Mailchimp API Key

### Option A: Mailchimp Transactional (Mandrill) - Recommended
1. **Log into Mailchimp** at https://mailchimp.com
2. **Navigate to** Account & Settings → Extras → API Keys
3. **Create a new API key** or use existing one
4. **Copy the API key** (format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us##`)

### Option B: Mailchimp Transactional Email (Mandrill)
If you need transactional emails (recommended for better deliverability):
1. **Go to** https://mandrillapp.com/
2. **Sign in** with your Mailchimp account
3. **Navigate to** Settings → SMTP & API Info
4. **Generate a new API key**
5. **Copy the API key** (different format than regular Mailchimp)

## Step 2: Verify Your Domain (Recommended)

### For Better Email Deliverability:
1. **In Mailchimp**, go to Account & Settings → Domains
2. **Add your domain** (e.g., `quoteevaluator.com`)
3. **Follow the verification steps** (DNS records)
4. **Wait for verification** (can take up to 24 hours)

## Step 3: Set Environment Variables

Add these to your `.env.local` file:

```bash
# Mailchimp Configuration
MAILCHIMP_API_KEY=your_mailchimp_api_key_here
MAILCHIMP_FROM_EMAIL=hello@quoteevaluator.com
NEXT_PUBLIC_BASE_URL=https://quoteevaluator.com
```

### Important Notes:
- **Replace `your_api_key_here`** with your actual API key
- **Use your verified domain** for the FROM email
- **Update the base URL** to match your production domain

## Step 4: Test the Integration

### Local Testing:
```bash
# Start your development server
npm run dev

# Test the API endpoint
curl -X POST http://localhost:3000/api/send-checklist \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@example.com", "type": "free_analysis"}'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Checklist sent to your email!",
  "email": "your-test-email@example.com",
  "downloadUrl": "/checklist.html",
  "emailSent": true,
  "instructions": "Check your email for the complete contractor red flags checklist!"
}
```

## Step 5: Production Deployment

### Environment Variables for Production:
Set these in your hosting platform (Vercel, Netlify, etc.):

```bash
MAILCHIMP_API_KEY=your_production_api_key
MAILCHIMP_FROM_EMAIL=hello@quoteevaluator.com
NEXT_PUBLIC_BASE_URL=https://quoteevaluator.com
```

### Deployment Platforms:

#### Vercel:
1. **Go to** your Vercel dashboard
2. **Select your project** → Settings → Environment Variables
3. **Add each variable** with the values above
4. **Redeploy** your application

#### Netlify:
1. **Go to** your Netlify dashboard
2. **Select your site** → Site settings → Environment variables
3. **Add each variable** with the values above
4. **Redeploy** your application

## Step 6: Monitor Email Delivery

### Mailchimp Dashboard:
1. **Check** Reports → Email activity
2. **Monitor** delivery rates, opens, clicks
3. **Watch for** bounces or spam complaints

### Application Logs:
- Look for `✅ Checklist email sent to: email@example.com`
- Watch for errors: `❌ Email send failed:`

## Troubleshooting

### Common Issues:

#### 1. API Key Invalid
**Error**: `Invalid API key`
**Solution**: 
- Verify API key is correct
- Check if using Mailchimp vs Mandrill key
- Ensure no extra spaces in environment variable

#### 2. Domain Not Verified
**Error**: `From email domain not verified`
**Solution**:
- Complete domain verification in Mailchimp
- Use a verified email address
- Temporarily use `noreply@mailchimp.com` for testing

#### 3. Rate Limiting
**Error**: `Rate limit exceeded`
**Solution**:
- Mailchimp has sending limits (free: 500/day)
- Upgrade plan if needed
- Implement queuing for high volume

#### 4. Emails Going to Spam
**Solutions**:
- Complete domain verification
- Set up SPF, DKIM, DMARC records
- Use consistent FROM name and email
- Include unsubscribe link
- Monitor engagement rates

### Test Email Not Received?

1. **Check spam folder**
2. **Verify API key** is working
3. **Check Mailchimp activity logs**
4. **Try different email address**
5. **Verify domain settings**

## Email Template Customization

The email template is defined in `src/app/api/send-checklist/route.ts`:

### Key Sections:
- **Subject line**: Customize in `sendWelcomeEmail()` function
- **HTML template**: Modify `getEmailTemplate()` function
- **Plain text**: Update `getPlainTextVersion()` function

### Customization Ideas:
- Add your logo/branding
- Personalize based on signup type
- Include seasonal messaging
- Add social media links
- Include customer testimonials

## Analytics and Tracking

### Built-in Tracking:
- **Email opens** (`track_opens: true`)
- **Link clicks** (`track_clicks: true`)
- **Delivery status**

### Google Analytics Events:
- `email_signup` - User enters email
- `checklist_delivered` - Email sent successfully
- `checklist_downloaded` - User clicks download link

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** only
3. **Rotate API keys** periodically
4. **Monitor for suspicious activity**
5. **Implement rate limiting** for high volume

## Upgrade Path

### Free Plan Limits:
- **500 emails/day**
- **2,000 contacts**
- **Basic templates**

### Paid Plan Benefits:
- **Higher sending limits**
- **Advanced analytics**
- **A/B testing**
- **Priority support**
- **Custom domains**

## Support

### Getting Help:
- **Mailchimp Support**: https://mailchimp.com/help/
- **API Documentation**: https://mailchimp.com/developer/
- **Community Forum**: https://mailchimp.com/help/community/

### Need Assistance?
If you run into issues, check the application logs first, then the Mailchimp activity logs. Most issues are related to API key configuration or domain verification.

---

## Quick Start Checklist

- [ ] Create Mailchimp account
- [ ] Get API key
- [ ] Verify domain (optional but recommended)
- [ ] Set environment variables
- [ ] Test locally
- [ ] Deploy to production
- [ ] Send test email
- [ ] Monitor delivery
- [ ] Customize template (optional)

**You're ready to start building your email list with automated checklist delivery!** 🚀