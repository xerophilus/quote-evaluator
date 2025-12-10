// Google Analytics 4 Configuration and Enhanced Conversion Tracking

export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX';
export const GOOGLE_ADS_ID = 'AW-997581352';

// Conversion events configuration
export const GA4_CONVERSIONS = {
  // Core conversion events
  QUOTE_UPLOAD: {
    name: 'quote_uploaded',
    value: 0, // No monetary value
  },
  
  PAYMENT_COMPLETE: {
    name: 'purchase',
  },
  
  EMAIL_SIGNUP: {
    name: 'sign_up',
    value: 5, // Lead value
  },
  
  PRO_ANALYSIS_START: {
    name: 'begin_checkout',
  },
  
  // Micro-conversions
  ANALYSIS_VIEW: {
    name: 'view_item',
  },
  
  SHARE_QUOTE: {
    name: 'share',
  }
};

// Enhanced Ecommerce tracking
export const trackEnhancedEcommerce = {
  viewItem: (itemName: string, price: number, category: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'USD',
        value: price,
        items: [{
          item_id: itemName.toLowerCase().replace(/\s+/g, '_'),
          item_name: itemName,
          item_category: category,
          price: price,
          quantity: 1
        }]
      });
    }
  },

  addToCart: (itemName: string, price: number, category: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: price,
        items: [{
          item_id: itemName.toLowerCase().replace(/\s+/g, '_'),
          item_name: itemName,
          item_category: category,
          price: price,
          quantity: 1
        }]
      });
    }
  },

  beginCheckout: (items: Array<{name: string, price: number}>, total: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: total,
        items: items.map(item => ({
          item_id: item.name.toLowerCase().replace(/\s+/g, '_'),
          item_name: item.name,
          price: item.price,
          quantity: 1
        }))
      });
    }
  },

  purchase: (transactionId: string, items: Array<{name: string, price: number}>, total: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: total,
        currency: 'USD',
        items: items.map(item => ({
          item_id: item.name.toLowerCase().replace(/\s+/g, '_'),
          item_name: item.name,
          price: item.price,
          quantity: 1
        }))
      });
      
      // Also track Google Ads conversion
      window.gtag('event', 'conversion', {
        'send_to': `${GOOGLE_ADS_ID}/purchase`,
        'value': total,
        'currency': 'USD',
        'transaction_id': transactionId
      });
    }
  }
};

// Custom dimensions for better segmentation
export const setUserProperties = (properties: {
  user_type?: 'free' | 'pro' | 'subscription',
  traffic_source?: string,
  first_visit_date?: string,
  total_quotes_analyzed?: number,
  lifetime_value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
};

// Track traffic sources with UTM parameters
export const trackTrafficSource = () => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const source = {
    utm_source: urlParams.get('utm_source') || 'direct',
    utm_medium: urlParams.get('utm_medium') || 'none',
    utm_campaign: urlParams.get('utm_campaign') || '',
    utm_term: urlParams.get('utm_term') || '',
    utm_content: urlParams.get('utm_content') || '',
    referrer: document.referrer || 'direct'
  };
  
  // Store in session for attribution
  sessionStorage.setItem('traffic_source', JSON.stringify(source));
  
  // Set custom dimensions
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      traffic_source: source.utm_source,
      traffic_medium: source.utm_medium,
      traffic_campaign: source.utm_campaign,
      custom_referrer: source.referrer
    });
  }
  
  return source;
};

// Get current traffic source from session
export const getCurrentTrafficSource = () => {
  if (typeof window === 'undefined') return null;
  
  const stored = sessionStorage.getItem('traffic_source');
  if (stored) {
    return JSON.parse(stored);
  }
  
  return trackTrafficSource();
};

// Enhanced conversion tracking with value
export const trackConversionWithValue = (
  conversionType: 'quote_upload' | 'payment' | 'email_signup' | 'analysis_start',
  value: number,
  additionalParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const trafficSource = getCurrentTrafficSource();
    
    const params = {
      value: value,
      currency: 'USD',
      ...trafficSource,
      ...additionalParams
    };
    
    // Track in GA4
    window.gtag('event', conversionType, params);
    
    // Track in Google Ads
    window.gtag('event', 'conversion', {
      'send_to': `${GOOGLE_ADS_ID}/${conversionType}`,
      'value': value,
      'currency': 'USD'
    });
  }
};

// Funnel tracking
export const trackFunnelStep = (
  step: number,
  stepName: string,
  funnelName: 'main_conversion' | 'email_capture' | 'upsell'
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'funnel_step', {
      funnel_name: funnelName,
      funnel_step: step,
      funnel_step_name: stepName
    });
  }
};

// Session quality scoring
export const calculateSessionQuality = () => {
  if (typeof window === 'undefined') return 0;
  
  let score = 0;
  
  // Check various engagement signals
  const timeOnSite = parseInt(sessionStorage.getItem('time_on_site') || '0');
  const pagesViewed = parseInt(sessionStorage.getItem('pages_viewed') || '1');
  const actionsCompleted = parseInt(sessionStorage.getItem('actions_completed') || '0');
  
  // Score based on engagement
  if (timeOnSite > 30) score += 20;
  if (timeOnSite > 60) score += 20;
  if (timeOnSite > 180) score += 20;
  
  if (pagesViewed > 1) score += 15;
  if (pagesViewed > 3) score += 15;
  
  if (actionsCompleted > 0) score += 10;
  
  return Math.min(score, 100);
};