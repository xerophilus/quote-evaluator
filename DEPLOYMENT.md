# 🚀 Deployment Guide for QuoteEvaluator.com

## Prerequisites

### Required Environment Variables
Create a `.env.local` file with:

```bash
# OpenAI API (Required)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Stripe Configuration (Required)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here

# App URL (Update for production)
NEXT_PUBLIC_APP_URL=https://quoteevaluator.com
```

### Get API Keys

1. **OpenAI API Key**: 
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create new secret key
   - Set up billing (pay-per-use)

2. **Stripe Keys**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - **IMPORTANT**: Switch to LIVE mode for production
   - Copy Live keys (they start with `sk_live_` and `pk_live_`)
   - Set up your products and price IDs

### Update Stripe Price IDs

In `src/app/api/create-checkout-session/route.ts`, update the PRODUCT_PRICE_IDS:

```typescript
const PRODUCT_PRICE_IDS = {
  single: 'price_YOUR_LIVE_SINGLE_PRICE_ID', // Replace with actual Live Price ID
  subscription: 'price_YOUR_LIVE_SUBSCRIPTION_PRICE_ID', // Replace with actual Live Price ID
};
```

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Pros**: 
- Full Next.js support including API routes
- Automatic deployments
- Built-in domain management
- Environment variables management

**Steps**:

1. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all the environment variables from above

3. **Domain Setup**:
   - In Vercel Dashboard → Domains
   - Add quoteevaluator.com
   - Update your domain's DNS to point to Vercel

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Firebase Hosting + Functions (More Complex)

**Pros**: 
- Google infrastructure
- Firebase ecosystem integration

**Cons**: 
- Requires Firebase Functions for API routes
- More complex setup

**Steps**:

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase**:
   ```bash
   firebase init
   # Select: Hosting, Functions
   # Choose existing project: quote-evaluator-prod
   ```

3. **Configure for Next.js**:
   - Update `next.config.ts` for static export (API routes won't work)
   - OR set up Firebase Functions for API routes (complex)

4. **Build and Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

**Note**: The current configuration requires API routes for Stripe payments and OpenAI integration. Firebase static hosting won't support these. You'd need to migrate API routes to Firebase Functions.

### Option 3: Other Platforms

- **Netlify**: Similar to Vercel, supports Next.js
- **Railway**: Good for full-stack apps
- **DigitalOcean App Platform**: Another alternative

## Recommended Approach

**Use Vercel** - It's the simplest option that supports all your current functionality without changes.

## Post-Deployment Checklist

### 1. Test Core Functionality
- [ ] Upload and analyze a quote (free tier)
- [ ] Test Pro payment flow end-to-end
- [ ] Test subscription payment flow
- [ ] Verify email subscription lookup works
- [ ] Test PDF parsing with real files

### 2. Stripe Configuration
- [ ] Switch Stripe to Live mode
- [ ] Update webhook endpoints in Stripe dashboard
- [ ] Test real payments with small amounts
- [ ] Verify subscription billing cycles

### 3. Domain & SSL
- [ ] Configure quoteevaluator.com DNS
- [ ] Verify SSL certificate is active
- [ ] Test www.quoteevaluator.com redirect

### 4. Performance & SEO
- [ ] Run Lighthouse audit
- [ ] Add Google Analytics (optional)
- [ ] Add robots.txt and sitemap.xml
- [ ] Test mobile responsiveness

### 5. Monitoring
- [ ] Set up error tracking (Sentry recommended)
- [ ] Monitor API usage and costs
- [ ] Set up uptime monitoring

### 6. Security
- [ ] Verify environment variables are secure
- [ ] Test CORS policies
- [ ] Verify rate limiting is working

## Quick Start for Vercel

If you want to go live quickly with Vercel:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Configure Domain**:
   - Add quoteevaluator.com in Vercel dashboard
   - Update DNS records as shown

4. **Go Live**! 🎉

## Support

If you need help with deployment:
- Check Vercel docs: https://vercel.com/docs
- Stripe integration: https://stripe.com/docs/checkout
- OpenAI API: https://platform.openai.com/docs 