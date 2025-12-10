import { NextRequest, NextResponse } from 'next/server';

// Mark cart as recovered
export async function POST(request: NextRequest) {
  try {
    const { cartId } = await request.json();
    
    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID required' }, { status: 400 });
    }
    
    // In production, update database
    // For now, we'll just track the recovery
    console.log(`Cart ${cartId} marked as recovered`);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Cart recovery error:', error);
    return NextResponse.json(
      { error: 'Failed to recover cart' },
      { status: 500 }
    );
  }
}

// Get recovery data
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cartId = url.searchParams.get('cartId');
    const discountCode = url.searchParams.get('discount');
    
    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID required' }, { status: 400 });
    }
    
    // In production, fetch from database
    const recoveryData = {
      cartId,
      discountCode,
      discountPercentage: discountCode ? 10 : 0,
      validUntil: discountCode ? Date.now() + (24 * 60 * 60 * 1000) : null // 24 hours
    };
    
    return NextResponse.json(recoveryData);
    
  } catch (error) {
    console.error('Get recovery data error:', error);
    return NextResponse.json(
      { error: 'Failed to get recovery data' },
      { status: 500 }
    );
  }
}