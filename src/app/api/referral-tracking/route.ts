import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const referralSchema = z.object({
  referralCode: z.string().min(1),
  action: z.enum(['signup', 'analysis', 'payment']),
  userEmail: z.string().email().optional(),
  amount: z.number().optional()
});

// Simple in-memory store for demo - in production, use a database
const referralData = new Map<string, {
  referrerId: string;
  referrals: Array<{
    email?: string;
    action: string;
    timestamp: Date;
    amount?: number;
  }>;
  totalCredits: number;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, action, userEmail, amount } = referralSchema.parse(body);
    
    // Track referral action
    const existing = referralData.get(referralCode) || {
      referrerId: referralCode,
      referrals: [],
      totalCredits: 0
    };
    
    // Add new referral
    existing.referrals.push({
      email: userEmail,
      action,
      timestamp: new Date(),
      amount
    });
    
    // Award credits based on action
    let creditsEarned = 0;
    if (action === 'analysis') {
      creditsEarned = 1; // $1 credit for each successful analysis
    } else if (action === 'payment' && amount) {
      creditsEarned = Math.min(amount * 0.1, 5); // 10% commission, max $5
    }
    
    existing.totalCredits += creditsEarned;
    referralData.set(referralCode, existing);
    
    return NextResponse.json({ 
      success: true, 
      creditsEarned,
      totalCredits: existing.totalCredits 
    });
  } catch (error) {
    console.error('Referral tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track referral' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const referralCode = url.searchParams.get('code');
    
    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 });
    }
    
    const data = referralData.get(referralCode);
    if (!data) {
      return NextResponse.json({ totalCredits: 0, referrals: [] });
    }
    
    return NextResponse.json({
      totalCredits: data.totalCredits,
      referralCount: data.referrals.length,
      recentReferrals: data.referrals.slice(-5) // Last 5 referrals
    });
  } catch (error) {
    console.error('Get referral data error:', error);
    return NextResponse.json(
      { error: 'Failed to get referral data' },
      { status: 500 }
    );
  }
}