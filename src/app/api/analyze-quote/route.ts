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

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.warn('OpenAI API key not configured, using mock data');
      return NextResponse.json(getMockResult(analysisType));
    }

    try {
      // Always generate full analysis, let frontend handle free/pro display
      const result = await analyzeWithOpenAI(quoteText);
      return NextResponse.json(result);
    } catch (openAIError) {
      console.error('OpenAI API error:', openAIError);
      // Fallback to mock data if OpenAI fails - always full analysis
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
function getMockResult(analysisType: 'free' | 'pro' | 'subscription' | 'rush'): AnalysisResult {
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
    redFlags: (analysisType === 'pro' || analysisType === 'subscription' || analysisType === 'rush') ? [
      "🚨 Vague 'labor and project management' fee - $4,500 is 25% of total project cost, unusually high for project management alone",
      "🚨 No breakdown of cabinet materials or brand specifications - you could be getting low-quality materials for premium prices",
      "🚨 Missing timeline for project completion - no start date or estimated duration provided",
      "🚨 No warranty information provided - critical for protecting your investment",
      "🚨 Contingency fund seems low - 10% might not cover major unexpected issues",
      "🚨 No mention of subcontractor licensing or insurance verification",
      "🚨 Missing details on appliance hookups and testing procedures"
    ] : undefined,
    costComparison: (analysisType === 'pro' || analysisType === 'subscription' || analysisType === 'rush') ? [
      "📊 Kitchen cabinets: Your quote ($8,500) vs National average ($7,200) - 18% higher than average",
      "📊 Granite countertops: Your quote ($3,200) vs National average ($3,500) - 9% lower than average (good value!)",
      "📊 Plumbing work: Your quote ($1,800) vs National average ($1,600) - 13% higher than average",
      "📊 Electrical work: Your quote ($2,100) vs National average ($1,900) - 11% higher than average",
      "📊 Project management: Your quote ($4,500) vs National average ($2,800) - 61% higher than average",
      "📊 Demolition: Your quote ($1,200) vs National average ($1,000) - 20% higher than average",
      "📊 Permits: Your quote ($800) vs National average ($600) - 33% higher than average"
    ] : undefined,
    smartQuestions: (analysisType === 'pro' || analysisType === 'subscription' || analysisType === 'rush') ? [
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
    healthScore: (analysisType === 'pro' || analysisType === 'subscription' || analysisType === 'rush') ? {
      grade: "C+",
      color: "orange",
      description: "Some concerns identified - review carefully before proceeding",
      percentage: 72
    } : undefined,
    majorConcern: (analysisType === 'pro' || analysisType === 'subscription' || analysisType === 'rush') ? "Project management fee is 61% higher than average - this could indicate overcharging or poor project planning." : undefined,
    extractedInfo: (analysisType === 'pro' || analysisType === 'subscription' || analysisType === 'rush') ? {
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

// OpenAI integration
async function analyzeWithOpenAI(quoteText: string): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Always use the better model for consistent analysis quality
  const model = 'gpt-4o';
  
  // Always generate full Pro analysis for better UX and conversion
  const prompt = `You are an expert contractor and construction analyst with expertise across all areas of home renovation and construction. Analyze this contractor quote and break it down in plain English, clearly explaining what's included in each line item.

First, identify what type of project this is (kitchen remodel, bathroom renovation, roofing, HVAC, etc.) based on the line items and scope.

For the plain English breakdown, group related items into 4-7 main categories. Each explanation should be clear and factual:
- What specific items/services are included
- Quantities, materials, or scope mentioned
- Keep it straightforward and factual

Then provide professional analysis for pro features.

Format your response as a JSON object with these exact fields:
- plainEnglishBreakdown: array of 4-7 clear strings (use **bold** for category names and costs, explain what's actually included)
- redFlags: array of strings (potential issues, start each with 🚨, limit to 3-5 most important)
- costComparison: array of strings (comparisons to national averages, start each with 📊, limit to 3-5 most important)
- smartQuestions: array of strings (questions to ask the contractor, start each with 🔍, limit to 3-5 most important)
- healthScore: object with { grade: string, color: string, description: string, percentage: number }
- majorConcern: string (single biggest concern)
- extractedInfo: object with { totalPrice: number (total quote amount, null if not found), contractorName: string (person's name, null if not found), contractorCompany: string (business name, null if not found), projectType: string (e.g., "Kitchen Remodel", "Bathroom Renovation") }

Quote: ${quoteText}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ 
        role: 'user', 
        content: prompt 
      }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    return parsed as AnalysisResult;
  } catch (error) {
    console.error('Failed to parse OpenAI response:', content, error);
    throw new Error('Invalid response format from OpenAI');
  }
} 