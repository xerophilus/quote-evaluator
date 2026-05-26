import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Simple in-memory store for demo - in production, use database
const abandonedCarts = new Map<string, any>();
const emailQueue = new Map<string, NodeJS.Timeout>();

const abandonedCartSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  quoteId: z.string(),
  analysisType: z.enum(['pro', 'subscription', 'repeat']),
  totalPrice: z.number(),
  formData: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email(),
  }),
  timestamp: z.number(),
  projectType: z.string().optional(),
  remindersSent: z.number().default(0),
  recovered: z.boolean().default(false)
});

// Save abandoned cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cartData = abandonedCartSchema.parse(body);
    
    // Store cart data
    abandonedCarts.set(cartData.id, cartData);
    
    // Schedule first reminder email (15 minutes)
    scheduleReminderEmail(cartData.id, 1, 15 * 60 * 1000); // 15 minutes
    
    // Schedule second reminder email (24 hours)
    scheduleReminderEmail(cartData.id, 2, 24 * 60 * 60 * 1000); // 24 hours
    
    return NextResponse.json({ success: true, cartId: cartData.id });
    
  } catch (error) {
    console.error('Abandoned cart save error:', error);
    return NextResponse.json(
      { error: 'Failed to save abandoned cart' },
      { status: 500 }
    );
  }
}

// Get abandoned cart data
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const cartId = url.searchParams.get('id');
    const email = url.searchParams.get('email');
    
    if (cartId) {
      const cart = abandonedCarts.get(cartId);
      if (!cart) {
        return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
      }
      return NextResponse.json(cart);
    }
    
    if (email) {
      // Find recent cart for email
      const recentCart = Array.from(abandonedCarts.values()).find(
        cart => cart.email === email && 
                !cart.recovered && 
                Date.now() - cart.timestamp < 24 * 60 * 60 * 1000
      );
      
      return NextResponse.json(recentCart || null);
    }
    
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    
  } catch (error) {
    console.error('Get abandoned cart error:', error);
    return NextResponse.json(
      { error: 'Failed to get cart data' },
      { status: 500 }
    );
  }
}

// Schedule reminder email
function scheduleReminderEmail(cartId: string, reminderNumber: number, delay: number) {
  const timeoutId = setTimeout(async () => {
    const cart = abandonedCarts.get(cartId);
    
    if (!cart || cart.recovered || cart.remindersSent >= reminderNumber) {
      return;
    }
    
    try {
      await sendReminderEmail(cart, reminderNumber);
      
      // Update cart with reminder sent
      cart.remindersSent = Math.max(cart.remindersSent, reminderNumber);
      abandonedCarts.set(cartId, cart);
      
    } catch (error) {
      console.error(`Failed to send reminder ${reminderNumber} for cart ${cartId}:`, error);
    }
  }, delay);
  
  emailQueue.set(`${cartId}_${reminderNumber}`, timeoutId);
}

// Send reminder email
async function sendReminderEmail(cart: any, reminderNumber: number) {
  const discountCode = `SAVE10${cart.id.slice(-6).toUpperCase()}`;
  
  let subject: string;
  let htmlContent: string;
  
  if (reminderNumber === 1) {
    subject = "Complete your quote analysis - don't overpay!";
    htmlContent = generateFirstReminderEmail(cart);
  } else {
    subject = "🔥 Save 10% on your quote analysis - Limited time!";
    htmlContent = generateSecondReminderEmail(cart, discountCode);
  }
  
  // Send via Mailchimp or your email service
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: cart.email,
        subject,
        html: htmlContent,
        type: 'cart_recovery',
        metadata: {
          cartId: cart.id,
          reminderNumber,
          discountCode: reminderNumber === 2 ? discountCode : undefined
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Email service error');
    }
    
    console.log(`Sent reminder ${reminderNumber} to ${cart.email} for cart ${cart.id}`);
    
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

function generateFirstReminderEmail(cart: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Complete Your Quote Analysis</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">You're just one step away!</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Don't let contractors overcharge you</p>
        </div>
        
        <p>Hi ${cart.formData.firstName || 'there'},</p>
        
        <p>We noticed you started analyzing your ${cart.projectType || 'home improvement'} quote but didn't complete your purchase.</p>
        
        <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3B82F6;">
          <h3 style="margin: 0 0 15px 0; color: #1F2937;">Your Analysis Order</h3>
          <p style="margin: 5px 0; color: #4B5563;"><strong>Type:</strong> ${cart.analysisType.charAt(0).toUpperCase() + cart.analysisType.slice(1)} Analysis</p>
          <p style="margin: 5px 0; color: #4B5563;"><strong>Total:</strong> $${cart.totalPrice.toFixed(2)}</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
          <p style="color: white; margin: 0; font-size: 18px; font-weight: bold;">🎯 Average Customer Saves $2,847!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/?recover=${cart.id}" 
             style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Complete Your Analysis Now →
          </a>
        </div>
        
        <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6B7280; font-size: 14px; margin: 0;">
            Questions? Simply reply to this email or visit our website.
          </p>
          <p style="color: #6B7280; font-size: 14px; margin: 10px 0 0 0;">
            Best regards,<br>
            The QuoteEvaluator Team
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

function generateSecondReminderEmail(cart: any, discountCode: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Save 10% - Limited Time Offer</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0 0 10px 0; font-size: 28px;">Special Offer Just for You!</h1>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">Save 10% on your quote analysis</p>
        </div>
        
        <div style="padding: 30px;">
          <p>Hi ${cart.formData.firstName || 'there'},</p>
          
          <p>We don't want you to miss out! Here's a special discount just for you.</p>
          
          <div style="text-align: center; background: #FEF3C7; border: 2px dashed #F59E0B; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; color: #92400E; font-size: 16px;">Use discount code:</p>
            <div style="background: white; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #059669; letter-spacing: 2px;">
              ${discountCode}
            </div>
            <p style="margin: 15px 0 0 0; color: #92400E; font-weight: bold;">⏰ Expires in 24 hours!</p>
          </div>
          
          <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #166534;">Why choose QuoteEvaluator?</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px;">
              <li style="margin: 8px 0;">✅ Spot overcharges and hidden fees</li>
              <li style="margin: 8px 0;">✅ Get smart questions to ask contractors</li>
              <li style="margin: 8px 0;">✅ 30-day money-back guarantee</li>
              <li style="margin: 8px 0;">✅ Trusted by 50,000+ homeowners</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/?recover=${cart.id}&discount=${discountCode}" 
               style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 18px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
              Claim Your 10% Discount →
            </a>
          </div>
          
          <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6B7280; font-size: 14px; margin: 0;">
              Questions? Just reply to this email - we're here to help!
            </p>
            <p style="color: #6B7280; font-size: 14px; margin: 10px 0 0 0;">
              Best regards,<br>
              The QuoteEvaluator Team
            </p>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
}