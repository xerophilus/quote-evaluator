import { NextRequest, NextResponse } from 'next/server';

interface SaveQuoteRequest {
  userEmail: string;
  quoteData: {
    projectType: string;
    quoteText: string;
    analysisType: string;
  };
  analysisResult: {
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
  };
  quoteName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userEmail, quoteData, analysisResult, quoteName }: SaveQuoteRequest = await request.json();

    if (!userEmail || !quoteData || !analysisResult) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a unique quote ID
    const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // For now, store in localStorage (in a real app, this would be in a database)
    const savedQuote = {
      id: quoteId,
      userEmail,
      quoteName: quoteName || `Quote Analysis - ${new Date().toLocaleDateString()}`,
      quoteData,
      analysisResult,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // In a production app, you would save this to a database like:
    // await db.savedQuotes.create(savedQuote);

    return NextResponse.json({
      success: true,
      quoteId,
      message: 'Quote saved successfully',
      savedQuote,
    });
  } catch (error) {
    console.error('Save quote error:', error);
    return NextResponse.json(
      { error: 'Failed to save quote' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // In a production app, you would fetch from database:
    // const savedQuotes = await db.savedQuotes.findMany({ where: { userEmail } });

    // For now, return empty array as we're using localStorage
    return NextResponse.json({
      success: true,
      quotes: [],
      message: 'In this demo, quotes are stored locally in your browser. In production, they would be stored in a secure database.',
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve quotes' },
      { status: 500 }
    );
  }
} 