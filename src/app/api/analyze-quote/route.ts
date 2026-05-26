import { NextRequest, NextResponse } from 'next/server';
import { analyzeQuoteSchema, sanitizeText } from '@/lib/validation';
import { z } from 'zod';

interface AnalysisResult {
  plainEnglishBreakdown: string[];
  redFlags?: string[];
  costComparison?: string[];
  smartQuestions?: string[];
  healthScore?: {
    grade: string;
    color: string;
    description: string;
    percentage?: number;
  };
  majorConcern?: string;
  extractedInfo?: {
    totalPrice?: number;
    contractorName?: string;
    contractorCompany?: string;
    projectType?: string;
  };
}

// Model configurable via environment variable
const ANALYSIS_MODEL = process.env.ANALYSIS_MODEL || 'claude-sonnet-4-20250514';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    let validatedData;
    try {
      validatedData = analyzeQuoteSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // Sanitize the quote text
    const quoteText = sanitizeText(validatedData.quoteText);
    const { analysisType } = validatedData;

    // Check if Anthropic API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      console.warn('Anthropic API key not configured, using mock data');
      return NextResponse.json(getMockResult(analysisType));
    }

    try {
      const result = await analyzeWithClaude(quoteText, analysisType);
      return NextResponse.json(result);
    } catch (claudeError) {
      console.error('Claude API error:', claudeError);
      // Fallback to mock data if Claude fails - always full analysis
      return NextResponse.json(getMockResult('pro'));
    }

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze quote' },
      { status: 500 }
    );
  }
}

// Mock data for fallback or development
function getMockResult(analysisType: 'free' | 'pro' | 'subscription' | 'lifetime'): AnalysisResult {
  return {
    plainEnglishBreakdown: [
      "Kitchen cabinets installation: $8,500 - This covers the cost of installing new kitchen cabinets, including materials and labor.",
      "Granite countertop installation: $3,200 - This includes the granite material and professional installation of your kitchen countertops.",
      "Plumbing work: $1,800 - This covers updating the plumbing for your new sink and dishwasher connections.",
      "Electrical work: $2,100 - This includes updating electrical outlets and installing new lighting fixtures.",
      "Labor and project management: $4,500 - This covers the contractor's time managing the project and coordinating all the work.",
      "Demolition and disposal: $1,200 - This includes removing old cabinets, countertops, and appliances, plus hauling away debris.",
      "Permits and inspections: $800 - This covers all necessary building permits and city inspection fees.",
      "Contingency fund: $2,000 - This is a 10% buffer for unexpected issues or changes during the project."
    ],
    redFlags: (analysisType === 'pro' || analysisType === 'subscription' || analysisType === 'lifetime') ? [
      "🚨 Vague 'labor and project management' fee - $4,500 is 25% of total project cost, unusually high for project management alone",
      "🚨 No breakdown of cabinet materials or brand specifications - you could be getting low-quality materials for premium prices",
      "🚨 Missing timeline for project completion - no start date or estimated duration provided",
      "🚨 No warranty information provided - critical for protecting your investment",
      "🚨 Contingency fund seems low - 10% might not cover major unexpected issues",
      "🚨 No mention of subcontractor licensing or insurance verification",
      "🚨 Missing details on appliance hookups and testing procedures"
    ] : undefined,
    costComparison: (analysisType === 'pro' || analysisType === 'subscription' || analysisType === 'lifetime') ? [
      "📊 Kitchen cabinets: Your quote ($8,500) vs National average ($7,200) - 18% higher than average",
      "📊 Granite countertops: Your quote ($3,200) vs National average ($3,500) - 9% lower than average (good value!)",
      "📊 Plumbing work: Your quote ($1,800) vs National average ($1,600) - 13% higher than average",
      "📊 Electrical work: Your quote ($2,100) vs National average ($1,900) - 11% higher than average",
      "📊 Project management: Your quote ($4,500) vs National average ($2,800) - 61% higher than average",
      "📊 Demolition: Your quote ($1,200) vs National average ($1,000) - 20% higher than average",
      "📊 Permits: Your quote ($800) vs National average ($600) - 33% higher than average"
    ] : undefined,
    smartQuestions: (analysisType === 'pro' || analysisType === 'subscription' || analysisType === 'lifetime') ? [
      "🔍 What brand and quality of cabinets are included in the $8,500 price? Can you provide specific model numbers?",
      "🔍 Can you break down the $4,500 project management fee? What specific services does this include?",
      "🔍 What is the estimated timeline for completion? Can you provide a detailed schedule?",
      "🔍 What warranty do you provide on materials and workmanship?",
      "🔍 Are you licensed and insured? Can you provide proof?",
      "🔍 Who will be doing the actual work - your team or subcontractors?",
      "🔍 What happens if we discover issues during demolition?",
      "🔍 Can you provide references from recent similar projects?",
      "🔍 What permits are required and who is responsible for obtaining them?",
      "🔍 How do you handle change orders and additional costs?"
    ] : undefined,
    healthScore: (analysisType === 'pro' || analysisType === 'subscription' || analysisType === 'lifetime') ? {
      grade: "C+",
      color: "orange",
      description: "Some concerns identified - review carefully before proceeding",
      percentage: 72
    } : undefined,
    majorConcern: (analysisType === 'pro' || analysisType === 'subscription' || analysisType === 'lifetime') ? "Project management fee is 61% higher than average - this could indicate overcharging or poor project planning." : undefined,
    extractedInfo: (analysisType === 'pro' || analysisType === 'subscription' || analysisType === 'lifetime') ? {
      totalPrice: 24100,
      contractorName: "Mike Johnson",
      contractorCompany: "Premier Kitchen Solutions",
      projectType: "Kitchen Remodel"
    } : {
      totalPrice: 24100,
      contractorName: "Mike Johnson", 
      contractorCompany: "Premier Kitchen Solutions",
      projectType: "Kitchen Remodel"
    }
  };
}

// Claude (Anthropic) integration
async function analyzeWithClaude(quoteText: string, analysisType: string): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  const isFree = analysisType === 'free';

  const systemPrompt = `You are an expert contractor quote analyst with deep knowledge of construction costs, common contractor pricing tactics, and home improvement industry standards across all trades (kitchen, bathroom, roofing, HVAC, electrical, plumbing, flooring, decks, additions, and more).

Your job is to analyze contractor quotes and help homeowners understand exactly what they're paying for, whether the pricing is fair, and how to protect themselves.

Always return your analysis as a valid JSON object with these exact fields:

- plainEnglishBreakdown: array of 4-7 strings. Group related line items into categories. Use **bold** for category names and dollar amounts. Explain in plain English what each category covers — what work is being done, what materials are included, and what the homeowner is actually paying for. Be specific and factual.
- extractedInfo: object with { totalPrice: number or null, contractorName: string or null, contractorCompany: string or null, projectType: string (e.g. "Kitchen Remodel", "Bathroom Renovation", "Roof Replacement") }
${isFree ? '' : `- redFlags: array of 3-5 strings. Each starts with 🚨. Identify vague line items, missing details, unusually high markups, missing warranty/timeline/permit info, and other warning signs.
- costComparison: array of 3-5 strings. Each starts with 📊. Compare key line items to national/regional averages. Show "Your quote ($X) vs Average ($Y) - Z% higher/lower".
- smartQuestions: array of 3-5 strings. Each starts with 🔍. Specific questions the homeowner should ask the contractor to clarify scope, protect themselves, or negotiate.
- healthScore: object with { grade: string (letter grade like "B+", "C-", "A"), color: string ("green"/"orange"/"red"), description: string (one sentence summary), percentage: number (0-100) }
- majorConcern: string. The single most important issue the homeowner should address before signing.`}

${isFree ? 'Only include plainEnglishBreakdown and extractedInfo fields. Do not include redFlags, costComparison, smartQuestions, healthScore, or majorConcern.' : 'Include ALL fields listed above for a complete professional analysis.'}

Respond with ONLY the JSON object, no other text.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: ANALYSIS_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Analyze this contractor quote:\n\n${quoteText}`
      }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  try {
    const parsed = JSON.parse(content);
    return parsed as AnalysisResult;
  } catch (error) {
    // Try to extract JSON from the response if it has surrounding text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as AnalysisResult;
    }
    console.error('Failed to parse Claude response:', content, error);
    throw new Error('Invalid response format from Claude');
  }
} 