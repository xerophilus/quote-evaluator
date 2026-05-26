# QuoteEvaluator

AI-powered contractor quote analysis for homeowners. Upload or paste a quote and get a plain-English breakdown, red flags, cost comparisons, and questions to ask before you sign.

**Live site:** [quoteevaluator.com](https://quoteevaluator.com)

## What it does

- **Free tier** — Plain-language rewrite of line items
- **Pro ($4.99)** — Full analysis with red flags, cost benchmarks, health score, and negotiation questions
- **Pro+ ($9.99/mo)** — Unlimited analyses and saved quotes
- **Lifetime ($29.99)** — One-time access to Pro features

Supports PDF, DOC, DOCX, and pasted text. Works for kitchen remodels, bathrooms, roofing, and general contractor quotes.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Payments | Stripe Checkout |
| Database | Firebase Firestore |
| Email | Mailchimp |
| Analytics | Google Analytics / Ads, Hotjar, Vercel Analytics |
| Hosting | Vercel |

## Getting started

### Prerequisites

- Node.js 20+
- Accounts for [Anthropic](https://console.anthropic.com), [Stripe](https://dashboard.stripe.com), and [Firebase](https://console.firebase.google.com) (optional but recommended)

### Install

```bash
git clone https://github.com/xerophilus/quote-evaluator.git
cd quote-evaluator
npm install
```

### Environment variables

Create `.env.local` in the project root:

```bash
# AI (required)
ANTHROPIC_API_KEY=sk-ant-...

# Stripe (required)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase (optional — enables saved quotes in Firestore)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Mailchimp (optional — email signup & checklist delivery)
MAILCHIMP_API_KEY=
MAILCHIMP_AUDIENCE_ID=
MAILCHIMP_SERVER_PREFIX=
MAILCHIMP_FROM_EMAIL=hello@quoteevaluator.com

# Admin dashboard (optional)
ADMIN_SESSION_SECRET=
ADMIN_EMAILS=benji.pitts@gmail.com
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Project structure

```
src/
├── app/                  # Pages and API routes
│   ├── api/              # analyze-quote, checkout, payments, admin, etc.
│   ├── admin/            # Admin dashboard (Google auth)
│   ├── dashboard/        # User quote dashboard
│   └── guides/           # SEO cost guides
├── components/           # UI components
└── lib/                  # Firebase, analytics, validation, Stripe helpers
```

## Key routes

| Route | Description |
|-------|-------------|
| `/` | Main quote upload and analysis flow |
| `/dashboard` | Saved quotes for subscribers |
| `/admin` | Revenue and usage metrics (admin only) |
| `/guides` | SEO content hub |
| `/success` | Post-checkout confirmation |

## Deployment

Deployed on Vercel. Set all environment variables in the Vercel project settings, then:

```bash
git push origin main
```

Use **live** Stripe keys in production. Deploy Firestore rules with:

```bash
firebase deploy --only firestore:rules
```

## Admin access

The admin dashboard at `/admin` uses Google sign-in. Only emails listed in `ADMIN_EMAILS` can access it. Enable Google as a sign-in provider in the Firebase console.

## License

Private — all rights reserved.
