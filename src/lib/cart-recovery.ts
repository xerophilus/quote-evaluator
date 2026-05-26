// Abandoned Cart Recovery System

export interface AbandonedCart {
  id: string;
  email: string;
  quoteId: string;
  analysisType: 'pro' | 'subscription' | 'repeat';
  totalPrice: number;
  formData: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  timestamp: number;
  projectType?: string;
  remindersSent: number;
  recovered: boolean;
}

// Save abandoned cart data
export const saveAbandonedCart = (cartData: Omit<AbandonedCart, 'id' | 'timestamp' | 'remindersSent' | 'recovered'>) => {
  const abandonedCart: AbandonedCart = {
    ...cartData,
    id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    timestamp: Date.now(),
    remindersSent: 0,
    recovered: false
  };

  // Store in localStorage for immediate tracking
  const existing = JSON.parse(localStorage.getItem('abandoned_carts') || '[]');
  existing.push(abandonedCart);
  localStorage.setItem('abandoned_carts', JSON.stringify(existing.slice(-10))); // Keep last 10

  // Send to backend for email processing
  fetch('/api/abandoned-cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(abandonedCart)
  }).catch(error => console.error('Failed to save abandoned cart:', error));

  return abandonedCart.id;
};

// Mark cart as recovered
export const markCartRecovered = (cartId: string) => {
  // Update localStorage
  const existing = JSON.parse(localStorage.getItem('abandoned_carts') || '[]');
  const updated = existing.map((cart: AbandonedCart) => 
    cart.id === cartId ? { ...cart, recovered: true } : cart
  );
  localStorage.setItem('abandoned_carts', JSON.stringify(updated));

  // Notify backend
  fetch('/api/abandoned-cart/recover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartId })
  }).catch(error => console.error('Failed to mark cart as recovered:', error));
};

// Get recovery discount code
export const getRecoveryDiscount = (cartId: string): string => {
  return `SAVE10${cartId.slice(-6).toUpperCase()}`;
};

// Check if user has abandoned cart
export const checkForAbandonedCart = (email: string): AbandonedCart | null => {
  if (typeof window === 'undefined') return null;
  
  const existing = JSON.parse(localStorage.getItem('abandoned_carts') || '[]');
  const recent = existing.find((cart: AbandonedCart) => 
    cart.email === email && 
    !cart.recovered && 
    Date.now() - cart.timestamp < 24 * 60 * 60 * 1000 // 24 hours
  );
  
  return recent || null;
};

// Track cart abandonment event
export const trackCartAbandonment = (
  email: string, 
  analysisType: string, 
  totalPrice: number,
  stage: 'form_started' | 'payment_page' | 'payment_failed'
) => {
  // Analytics tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'cart_abandonment', {
      event_category: 'ecommerce',
      event_label: stage,
      value: totalPrice,
      analysis_type: analysisType,
      user_email_hash: btoa(email).substring(0, 10)
    });
  }

  // Hotjar tracking
  if ((window as any).hj) {
    (window as any).hj('event', 'cart_abandoned');
    (window as any).hj('tagRecording', ['cart_abandoned', stage, analysisType]);
  }
};

// Auto-save mechanism for forms
export class FormAutoSaver {
  private timeoutId: NodeJS.Timeout | null = null;
  private saveKey: string;
  
  constructor(saveKey: string) {
    this.saveKey = saveKey;
  }

  save = (data: any) => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      const saveData = {
        ...data,
        timestamp: Date.now(),
        url: window.location.href
      };
      
      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      
      // Track form progress
      if (window.gtag) {
        window.gtag('event', 'form_progress', {
          event_category: 'engagement',
          form_name: this.saveKey,
          completion_rate: this.calculateCompletionRate(data)
        });
      }
    }, 1000); // Save after 1 second of inactivity
  };

  load = (): any | null => {
    try {
      const saved = localStorage.getItem(this.saveKey);
      if (!saved) return null;
      
      const data = JSON.parse(saved);
      
      // Check if data is recent (within 24 hours)
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        this.clear();
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  };

  clear = () => {
    localStorage.removeItem(this.saveKey);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  };

  private calculateCompletionRate = (data: any): number => {
    const fields = ['email', 'firstName', 'lastName'];
    const filled = fields.filter(field => data[field] && data[field].length > 0).length;
    return Math.round((filled / fields.length) * 100);
  };
}

// Exit intent detection
export const setupExitIntentDetection = (onExitIntent: () => void) => {
  let triggered = false;

  const handleMouseLeave = (e: MouseEvent) => {
    if (e.clientY <= 0 && !triggered) {
      triggered = true;
      onExitIntent();
      
      // Track exit intent
      if (window.gtag) {
        window.gtag('event', 'exit_intent', {
          event_category: 'behavior',
          page_location: window.location.href
        });
      }
      
      setTimeout(() => { triggered = false; }, 5000); // Reset after 5 seconds
    }
  };

  document.addEventListener('mouseleave', handleMouseLeave);
  
  return () => {
    document.removeEventListener('mouseleave', handleMouseLeave);
  };
};

// Recovery email templates
export const getRecoveryEmailTemplate = (cart: AbandonedCart, reminderNumber: number) => {
  const discountCode = getRecoveryDiscount(cart.id);
  
  const templates = {
    1: {
      subject: "Complete your quote analysis - don't overpay!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">You're just one step away from saving money!</h2>
          
          <p>Hi ${cart.formData.firstName || 'there'},</p>
          
          <p>We noticed you started analyzing your ${cart.projectType || 'home improvement'} quote but didn't complete your purchase. Don't let contractors overcharge you!</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Your Analysis Order:</h3>
            <p style="margin: 5px 0;"><strong>Analysis Type:</strong> ${cart.analysisType.charAt(0).toUpperCase() + cart.analysisType.slice(1)}</p>
            <p style="margin: 5px 0;"><strong>Total:</strong> $${cart.totalPrice.toFixed(2)}</p>
          </div>
          
          <p><strong>🎯 Did you know?</strong> Our average customer saves $2,847 on their project!</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/?recover=${cart.id}" 
             style="display: inline-block; background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            Complete Your Analysis Now
          </a>
          
          <p>Have questions? Simply reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}">website</a>.</p>
          
          <p>Best regards,<br>The QuoteEvaluator Team</p>
        </div>
      `
    },
    2: {
      subject: "🔥 Save 10% on your quote analysis - Limited time!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Special Offer Just for You!</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Save 10% on your quote analysis</p>
          </div>
          
          <div style="padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hi ${cart.formData.firstName || 'there'},</p>
            
            <p>We don't want you to miss out! Use code <strong style="color: #10B981; font-size: 18px;">${discountCode}</strong> to get 10% off your quote analysis.</p>
            
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400E;"><strong>⏰ This offer expires in 24 hours!</strong></p>
            </div>
            
            <p>Why analyze your quote with us?</p>
            <ul style="color: #374151;">
              <li>✅ Spot overcharges and hidden fees</li>
              <li>✅ Get smart questions to ask contractors</li>
              <li>✅ 30-day money-back guarantee</li>
              <li>✅ Trusted by 50,000+ homeowners</li>
            </ul>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/?recover=${cart.id}&discount=${discountCode}" 
               style="display: inline-block; background: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold;">
              Claim Your 10% Discount
            </a>
            
            <p>Questions? Just reply to this email!</p>
            
            <p>Best regards,<br>The QuoteEvaluator Team</p>
          </div>
        </div>
      `
    }
  };

  return templates[reminderNumber as keyof typeof templates] || templates[1];
};