🧠 Project: QuoteEvaluator.com – MVP Build Guide for Cursor
📌 Summary:
An AI-powered tool that lets users upload or paste contractor quotes (starting with kitchen and bathroom remodels), and get:

A plain English explanation of the quote (free)

A smart breakdown with red flags and cost comparisons (paid)

⚙️ Tech Stack:
Frontend: Next.js + TailwindCSS

AI Models: OpenAI’s GPT-4o Mini (free tier) and GPT-4o (paid)

Backend: Firebase

Deployment: Vercel

🧩 Feature Breakdown
🔹 Free Tier (o4-mini)
User Flow:

Upload or paste quote

Select project type (Kitchen / Bathroom)

Get a plain English rewrite of each line item

Prompt Example:

You are a home renovation assistant. A user submitted a quote for a [project type]. Rewrite each line item in plain English. Do not provide analysis or judgment.
🔹 Paid Tier (GPT-4o)

User Flow:

Submit quote + project type

Receive:

Plain-language breakdown

Cost comparison vs U.S. averages

Red flags (e.g. vague fees, duplicate labor)

Suggested questions to ask contractor

Prompt Example:
You are an expert contractor quote analyst. Break down this [project type] quote in plain English. Then compare line item prices to U.S. national averages. Highlight any potential overcharges or vague charges. Format your response as:
1. Plain English Breakdown
2. Red Flags
3. Cost Comparison
4. Smart Questions to Ask


💵 Monetization Plan
Tier	Price	Features
Free	$0	1 plain-language rewrite (no cost comparison)
Pro	$9.99/quote	Full analysis, red flags, comparison
Pro+	$19.99/month	Unlimited quotes, quote comparisons, downloadable reports

🖥️ Pages to Build
/ – Main Page
Hero, explanation, call-to-action

Step 1: Select project type

Step 2: Upload or paste quote

Step 3: Choose free or Pro analysis

Results area (placeholder for now)

## 🛠️ Setup Instructions

### Environment Variables
Create a `.env.local` file in the root directory with:
```
# OpenAI API Key (required for real AI analysis)
OPENAI_API_KEY=your_openai_api_key_here

# Stripe Configuration (required for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# App URL (required for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting API Keys
1. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Stripe Keys**: Get from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - Use test keys for development (they start with `sk_test_` and `pk_test_`)
   - Switch to live keys for production

### Installation & Development
```bash
npm install
npm run dev
```

## 🪝 Development Progress

### ✅ Completed
- ✅ Set up app/page.tsx with Tailwind + three-step UI
- ✅ Universal quote analysis (removed project type step)
- ✅ File parsing for DOC, DOCX, TXT, PDF (server-side)
- ✅ API structure with proper TypeScript interfaces
- ✅ Modern responsive UI with loading states
- ✅ OpenAI API integration (GPT-4o with fallback to mock data)
- ✅ Stripe payment integration with checkout flow
- ✅ Payment verification and Pro feature unlocking
- ✅ Markdown formatting for analysis results
- ✅ Error boundaries and enhanced error handling

### 🔄 In Progress
- 🔄 Testing and deployment optimization

### 📋 Remaining Tasks
- ⏳ Firebase setup for user management (optional)
- ⏳ Production deployment preparation
- ⏳ Analytics and monitoring setup

✅ Phase 2 Ideas (Not MVP)
OCR support for scanned PDFs

Side-by-side quote comparisons

Contractor rating/flagging system

Affiliate monetization (Home Depot, Thumbtack, etc.)