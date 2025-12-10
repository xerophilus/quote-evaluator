"use client";

import { useEffect } from 'react';
import Script from 'next/script';

// Hotjar Site ID - Replace with your actual Hotjar ID
const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID || '3456789';
const HOTJAR_VERSION = 6;

declare global {
  interface Window {
    hj: any;
    _hjSettings: {
      hjid: number;
      hjsv: number;
    };
  }
}

export default function HotjarProvider() {
  useEffect(() => {
    // Initialize Hotjar
    if (typeof window !== 'undefined') {
      window._hjSettings = {
        hjid: parseInt(HOTJAR_ID),
        hjsv: HOTJAR_VERSION,
      };
    }
  }, []);

  // Hotjar tracking functions
  const hotjarAPI = {
    // Identify users for better segmentation
    identify: (userId: string, attributes?: Record<string, any>) => {
      if (typeof window !== 'undefined' && window.hj) {
        window.hj('identify', userId, attributes);
      }
    },

    // Track virtual page views (for SPAs)
    trackPageView: (pageName: string) => {
      if (typeof window !== 'undefined' && window.hj) {
        window.hj('stateChange', pageName);
      }
    },

    // Track custom events
    trackEvent: (eventName: string) => {
      if (typeof window !== 'undefined' && window.hj) {
        window.hj('event', eventName);
      }
    },

    // Tag recordings for easier filtering
    tagRecording: (tags: string[]) => {
      if (typeof window !== 'undefined' && window.hj) {
        window.hj('tagRecording', tags);
      }
    },

    // Track form interactions
    trackFormInteraction: (formName: string, action: 'start' | 'complete' | 'abandon') => {
      if (typeof window !== 'undefined' && window.hj) {
        window.hj('event', `form_${action}_${formName}`);
        
        // Tag recordings for form analysis
        if (action === 'abandon') {
          window.hj('tagRecording', ['form_abandoned', formName]);
        }
      }
    },

    // Track conversion funnel steps
    trackFunnelStep: (step: string, success: boolean) => {
      if (typeof window !== 'undefined' && window.hj) {
        window.hj('event', `funnel_${step}_${success ? 'success' : 'drop'}`);
        
        if (!success) {
          window.hj('tagRecording', ['funnel_drop', step]);
        }
      }
    },

    // Track user frustration signals
    trackFrustration: (type: 'rage_click' | 'dead_click' | 'error_message', details?: string) => {
      if (typeof window !== 'undefined' && window.hj) {
        window.hj('event', `frustration_${type}`);
        window.hj('tagRecording', ['frustration', type, details || '']);
      }
    }
  };

  // Make Hotjar API available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).hotjarAPI = hotjarAPI;
    }
  }, []);

  return (
    <>
      <Script
        id="hotjar-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${HOTJAR_ID},hjsv:${HOTJAR_VERSION}};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `,
        }}
      />
      
      {/* Hotjar Feedback Widget Configuration */}
      <Script
        id="hotjar-feedback"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Configure Hotjar feedback widget
            window.addEventListener('load', function() {
              if (window.hj) {
                // Set up custom triggers for feedback widget
                window.hj('trigger', 'feedback_widget');
                
                // Track specific user segments
                const userType = localStorage.getItem('user_type') || 'visitor';
                window.hj('identify', null, {
                  user_type: userType,
                  has_analyzed_quote: localStorage.getItem('has_analyzed_quote') || 'false',
                  subscription_status: localStorage.getItem('subscription_status') || 'none'
                });
              }
            });
          `,
        }}
      />
    </>
  );
}

// Export Hotjar tracking functions for use in components
export const hotjar = {
  identify: (userId: string, attributes?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).hotjarAPI) {
      (window as any).hotjarAPI.identify(userId, attributes);
    }
  },
  
  trackEvent: (eventName: string) => {
    if (typeof window !== 'undefined' && (window as any).hotjarAPI) {
      (window as any).hotjarAPI.trackEvent(eventName);
    }
  },
  
  trackPageView: (pageName: string) => {
    if (typeof window !== 'undefined' && (window as any).hotjarAPI) {
      (window as any).hotjarAPI.trackPageView(pageName);
    }
  },
  
  tagRecording: (tags: string[]) => {
    if (typeof window !== 'undefined' && (window as any).hotjarAPI) {
      (window as any).hotjarAPI.tagRecording(tags);
    }
  },
  
  trackFormInteraction: (formName: string, action: 'start' | 'complete' | 'abandon') => {
    if (typeof window !== 'undefined' && (window as any).hotjarAPI) {
      (window as any).hotjarAPI.trackFormInteraction(formName, action);
    }
  },
  
  trackFunnelStep: (step: string, success: boolean) => {
    if (typeof window !== 'undefined' && (window as any).hotjarAPI) {
      (window as any).hotjarAPI.trackFunnelStep(step, success);
    }
  },
  
  trackFrustration: (type: 'rage_click' | 'dead_click' | 'error_message', details?: string) => {
    if (typeof window !== 'undefined' && (window as any).hotjarAPI) {
      (window as any).hotjarAPI.trackFrustration(type, details);
    }
  }
};