// Google Analytics 4 Event Tracking Service
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// GA4 Measurement ID - Replace with your actual ID
const GA_MEASUREMENT_ID = 'AW-997581352'; // Your Google Ads ID from layout.tsx

// Helper to check if analytics is available
const isAnalyticsAvailable = () => {
  return typeof window !== 'undefined' && window.gtag;
};

// Initialize GA (already done in layout.tsx, but this ensures it's ready)
export const initGA = () => {
  if (typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function(...args: unknown[]) {
      window.dataLayer.push(args);
    };
  }
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
};

// Generic event tracking
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  parameters?: Record<string, unknown>
) => {
  if (!isAnalyticsAvailable()) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...parameters,
  });
};

// Page view tracking
export const trackPageView = (url: string, title?: string) => {
  if (!isAnalyticsAvailable()) return;
  
  window.gtag('event', 'page_view', {
    page_path: url,
    page_title: title || document.title,
  });
};

// Quote Analysis Events
export const trackQuoteAnalysis = {
  start: (type: 'free' | 'pro' | 'subscription') => {
    trackEvent('quote_analysis_start', 'Quote', type);
  },
  
  complete: (type: 'free' | 'pro' | 'subscription', projectType?: string) => {
    trackEvent('quote_analysis_complete', 'Quote', type, undefined, {
      project_type: projectType,
    });
  },
  
  error: (error: string) => {
    trackEvent('quote_analysis_error', 'Error', error);
  },
  
  textInput: (length: number) => {
    trackEvent('quote_text_input', 'Quote', 'manual', length);
  },
  
  fileUpload: (fileType: string, fileSize: number) => {
    trackEvent('quote_file_upload', 'Quote', fileType, fileSize);
  },
  
  pdfParse: (success: boolean, pageCount?: number) => {
    trackEvent('pdf_parse', 'Quote', success ? 'success' : 'failure', pageCount);
  },
};

// Payment Events
export const trackPayment = {
  checkoutStart: (type: 'single' | 'subscription', value: number) => {
    trackEvent('begin_checkout', 'Payment', type, value);
    
    // Enhanced e-commerce tracking
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: value,
      items: [{
        item_name: type === 'single' ? 'Pro Analysis' : 'Pro Subscription',
        price: value,
        quantity: 1,
      }],
    });
  },
  
  checkoutComplete: (type: 'single' | 'subscription', value: number, sessionId: string) => {
    trackEvent('purchase', 'Payment', type, value, {
      transaction_id: sessionId,
      currency: 'USD',
    });
    
    // Enhanced e-commerce tracking
    window.gtag('event', 'purchase', {
      transaction_id: sessionId,
      value: value,
      currency: 'USD',
      items: [{
        item_name: type === 'single' ? 'Pro Analysis' : 'Pro Subscription',
        price: value,
        quantity: 1,
      }],
    });
  },
  
  checkoutCancel: (type: 'single' | 'subscription') => {
    trackEvent('checkout_cancel', 'Payment', type);
  },
  
  billingPortalOpen: () => {
    trackEvent('billing_portal_open', 'Payment');
  },
};

// User Engagement Events
export const trackEngagement = {
  signupModalOpen: () => {
    trackEvent('signup_modal_open', 'Engagement');
  },
  
  signupComplete: (_email: string) => {
    trackEvent('sign_up', 'Engagement', 'email', undefined, {
      method: 'email',
    });
  },
  
  loginModalOpen: () => {
    trackEvent('login_modal_open', 'Engagement');
  },
  
  dashboardView: () => {
    trackEvent('dashboard_view', 'Engagement');
  },
  
  savedQuoteView: (quoteId: string) => {
    trackEvent('saved_quote_view', 'Engagement', quoteId);
  },
  
  savedQuoteDelete: (quoteId: string) => {
    trackEvent('saved_quote_delete', 'Engagement', quoteId);
  },
  
  downloadChecklist: () => {
    trackEvent('download_checklist', 'Engagement');
  },
  
  scrollDepth: (percentage: number) => {
    trackEvent('scroll', 'Engagement', `${percentage}%`, percentage);
  },
  
  timeOnPage: (seconds: number) => {
    trackEvent('time_on_page', 'Engagement', 'seconds', seconds);
  },
  
  formInteraction: (formType: string, source: string) => {
    trackEvent('form_interaction', 'Engagement', formType, undefined, {
      source: source,
    });
  },
  
  userBehavior: (behavior: string) => {
    trackEvent('user_behavior', 'Engagement', behavior);
  },
};

// Feature Interaction Events
export const trackFeature = {
  redFlagsView: () => {
    trackEvent('red_flags_view', 'Feature');
  },
  
  costComparisonView: () => {
    trackEvent('cost_comparison_view', 'Feature');
  },
  
  smartQuestionsView: () => {
    trackEvent('smart_questions_view', 'Feature');
  },
  
  healthScoreView: (grade: string) => {
    trackEvent('health_score_view', 'Feature', grade);
  },
  
  expandSection: (section: string) => {
    trackEvent('expand_section', 'Feature', section);
  },
  
  collapseSection: (section: string) => {
    trackEvent('collapse_section', 'Feature', section);
  },
  
  copyToClipboard: (type: string) => {
    trackEvent('copy_to_clipboard', 'Feature', type);
  },
  
  shareQuote: (method: string) => {
    trackEvent('share_quote', 'Feature', method);
  },
};

// Button Click Events
export const trackClick = {
  cta: (buttonName: string, location: string) => {
    trackEvent('cta_click', 'Click', buttonName, undefined, {
      location: location,
    });
  },
  
  navigation: (link: string) => {
    trackEvent('navigation_click', 'Click', link);
  },
  
  social: (platform: string) => {
    trackEvent('social_click', 'Click', platform);
  },
  
  affiliate: (partner: string) => {
    trackEvent('affiliate_click', 'Click', partner);
  },
  
  help: (topic: string) => {
    trackEvent('help_click', 'Click', topic);
  },
};

// Error Tracking
export const trackError = {
  api: (endpoint: string, error: string) => {
    trackEvent('api_error', 'Error', endpoint, undefined, {
      error_message: error,
    });
  },
  
  payment: (error: string) => {
    trackEvent('payment_error', 'Error', error);
  },
  
  validation: (field: string, error: string) => {
    trackEvent('validation_error', 'Error', field, undefined, {
      error_message: error,
    });
  },
  
  fileUpload: (error: string) => {
    trackEvent('file_upload_error', 'Error', error);
  },
  
  general: (error: string, location?: string) => {
    trackEvent('general_error', 'Error', error, undefined, {
      location: location,
    });
  },
};

// Conversion Events
export const trackConversion = {
  freeAnalysis: () => {
    trackEvent('free_analysis_conversion', 'Conversion');
    window.gtag('event', 'conversion', {
      'send_to': 'AW-997581352/free_analysis',
    });
  },
  
  proAnalysis: (value: number) => {
    trackEvent('pro_analysis_conversion', 'Conversion', undefined, value);
    window.gtag('event', 'conversion', {
      'send_to': 'AW-997581352/pro_analysis',
      'value': value,
      'currency': 'USD',
    });
  },
  
  subscription: (value: number) => {
    trackEvent('subscription_conversion', 'Conversion', undefined, value);
    window.gtag('event', 'conversion', {
      'send_to': 'AW-997581352/subscription',
      'value': value,
      'currency': 'USD',
    });
  },
  
  emailSignup: (email?: string, source?: string) => {
    trackEvent('email_signup_conversion', 'Conversion', source, undefined, {
      email_hash: email ? btoa(email).substring(0, 10) : undefined,
    });
    window.gtag('event', 'conversion', {
      'send_to': 'AW-997581352/email_signup',
    });
  },
};

// Email Marketing Tracking
export const trackEmail = {
  // Email capture events
  signupAttempt: (source: string) => {
    trackEvent('email_signup_attempt', 'Email', source);
  },
  
  signupSuccess: (email: string, source: string, leadMagnet?: string) => {
    trackEvent('email_signup_success', 'Email', source, undefined, {
      lead_magnet: leadMagnet,
      email_hash: btoa(email).substring(0, 10), // Anonymized email tracking
    });
  },
  
  signupError: (source: string, error: string) => {
    trackEvent('email_signup_error', 'Email', source, undefined, {
      error_message: error,
    });
  },
  
  // Lead magnet events
  checklistDownload: (email?: string, source?: string) => {
    trackEvent('checklist_download', 'Lead Magnet', source, undefined, {
      email_hash: email ? btoa(email).substring(0, 10) : undefined,
    });
  },
  
  checklistView: (source?: string) => {
    trackEvent('checklist_view', 'Lead Magnet', source);
  },
  
  checklistPrint: (source?: string) => {
    trackEvent('checklist_print', 'Lead Magnet', source);
  },
  
  // Exit intent events
  exitIntentTriggered: (trigger: string) => {
    trackEvent('exit_intent_triggered', 'Email', trigger);
  },
  
  exitIntentDismissed: () => {
    trackEvent('exit_intent_dismissed', 'Email');
  },
  
  // Email sequence tracking
  emailDelivered: (emailType: 'welcome' | 'case_study' | 'final_discount', email: string) => {
    trackEvent('email_delivered', 'Email Sequence', emailType, undefined, {
      email_hash: btoa(email).substring(0, 10),
    });
  },
  
  emailOpened: (emailType: 'welcome' | 'case_study' | 'final_discount', email: string) => {
    trackEvent('email_opened', 'Email Sequence', emailType, undefined, {
      email_hash: btoa(email).substring(0, 10),
    });
  },
  
  emailClicked: (emailType: 'welcome' | 'case_study' | 'final_discount', email: string, linkType: string) => {
    trackEvent('email_clicked', 'Email Sequence', emailType, undefined, {
      email_hash: btoa(email).substring(0, 10),
      link_type: linkType,
    });
  },
  
  // Discount usage tracking
  discountApplied: (email: string, discountCode: string, source: string) => {
    trackEvent('discount_applied', 'Email', source, undefined, {
      email_hash: btoa(email).substring(0, 10),
      discount_code: discountCode,
    });
  },
  
  discountConversion: (email: string, discountCode: string, value: number) => {
    trackEvent('discount_conversion', 'Email', discountCode, value, {
      email_hash: btoa(email).substring(0, 10),
    });
  },
};

// Revenue Features Tracking
export const trackRevenue = {
  // Upsell Modal Events
  upsellModalShown: (analysisType: string, showDelay: number) => {
    trackEvent('upsell_modal_shown', 'Revenue', analysisType, showDelay, {
      modal_type: 'post_analysis_upsell',
      trigger_delay_seconds: showDelay
    });
  },
  
  upsellModalDismissed: (analysisType: string, timeVisible: number) => {
    trackEvent('upsell_modal_dismissed', 'Revenue', analysisType, timeVisible, {
      time_visible_seconds: timeVisible
    });
  },
  
  // Rush Analysis Events
  rushAnalysisSelected: (baseAnalysisType: string) => {
    trackEvent('rush_analysis_selected', 'Revenue', baseAnalysisType, 9.99, {
      upgrade_type: 'rush_premium',
      base_price: baseAnalysisType === 'pro' ? 4.99 : 0
    });
  },
  
  rushAnalysisDeselected: (baseAnalysisType: string) => {
    trackEvent('rush_analysis_deselected', 'Revenue', baseAnalysisType);
  },
  
  // Repeat Purchase Events
  repeatPurchaseShown: (analysisType: string, location: string) => {
    trackEvent('repeat_purchase_shown', 'Revenue', analysisType, undefined, {
      display_location: location,
      discount_offered: '50%'
    });
  },
  
  repeatPurchaseClicked: (analysisType: string) => {
    trackEvent('repeat_purchase_clicked', 'Revenue', analysisType, 4.99, {
      original_price: 4.99,
      discount_price: 4.99,
      discount_percentage: 0
    });
  },
  
  // Referral System Events
  referralLinkGenerated: (projectType: string, savings: string) => {
    trackEvent('referral_link_generated', 'Revenue', projectType, undefined, {
      estimated_savings: savings,
      referral_reward: '$1'
    });
  },
  
  referralLinkShared: (platform: string, projectType: string) => {
    trackEvent('referral_link_shared', 'Revenue', platform, undefined, {
      project_type: projectType,
      sharing_method: platform
    });
  },
  
  referralConversion: (referrerQuoteId: string, newUserAction: string) => {
    trackEvent('referral_conversion', 'Revenue', newUserAction, 1, {
      referrer_quote_id: referrerQuoteId,
      reward_earned: '$1'
    });
  },
  
  // Affiliate Link Events
  affiliateRecommendationsShown: (projectType: string, partnerCount: number) => {
    trackEvent('affiliate_recommendations_shown', 'Revenue', projectType, partnerCount, {
      recommendations_count: partnerCount
    });
  },
  
  affiliateCategoryExpanded: (category: string, projectType: string) => {
    trackEvent('affiliate_category_expanded', 'Revenue', category, undefined, {
      project_type: projectType
    });
  }
};

// Project Landing Page Tracking
export const trackProjectLanding = {
  // Page views
  pageView: (projectType: string, source?: string) => {
    trackEvent('project_landing_view', 'Page View', projectType, undefined, {
      traffic_source: source,
      page_type: 'project_landing',
    });
  },
  
  // Project-specific interactions
  analyzeClick: (projectType: string, analysisType: string) => {
    trackEvent('project_analyze_click', 'Conversion', projectType, undefined, {
      analysis_type: analysisType,
      page_type: 'project_landing',
    });
  },
  
  // File uploads by project
  fileUpload: (projectType: string, fileType: string) => {
    trackEvent('project_file_upload', 'Engagement', projectType, undefined, {
      file_type: fileType,
      page_type: 'project_landing',
    });
  },
  
  // Cost comparison views
  costComparisonView: (projectType: string) => {
    trackEvent('project_cost_comparison_view', 'Engagement', projectType, undefined, {
      page_type: 'project_landing',
    });
  },
  
  // Testimonial engagement
  testimonialView: (projectType: string, testimonialName: string) => {
    trackEvent('project_testimonial_view', 'Engagement', projectType, undefined, {
      testimonial_name: testimonialName,
      page_type: 'project_landing',
    });
  },
  
  // Red flags section engagement
  redFlagsView: (projectType: string) => {
    trackEvent('project_red_flags_view', 'Engagement', projectType, undefined, {
      page_type: 'project_landing',
    });
  },
  
  // Payment conversions by project
  paymentInitiated: (projectType: string, analysisType: string, amount: number) => {
    trackEvent('project_payment_initiated', 'Conversion', projectType, amount, {
      analysis_type: analysisType,
      page_type: 'project_landing',
    });
  },
  
  // Email signups from project pages
  emailSignup: (projectType: string, source: string) => {
    trackEvent('project_email_signup', 'Conversion', projectType, undefined, {
      signup_source: source,
      page_type: 'project_landing',
    });
  },
};

// User Properties
export const setUserProperties = (properties: Record<string, unknown>) => {
  if (!isAnalyticsAvailable()) return;
  
  window.gtag('set', 'user_properties', properties);
};

// Custom Dimensions
export const setCustomDimension = (name: string, value: string) => {
  if (!isAnalyticsAvailable()) return;
  
  window.gtag('event', 'page_view', {
    [name]: value,
  });
};

// Session Tracking
let sessionStartTime: number | null = null;

export const startSession = () => {
  sessionStartTime = Date.now();
  trackEvent('session_start', 'Session');
};

export const endSession = () => {
  if (sessionStartTime) {
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    trackEvent('session_end', 'Session', 'duration', duration);
    sessionStartTime = null;
  }
};

// A/B Testing Events
export const trackExperiment = (experimentName: string, variant: string) => {
  trackEvent('experiment_view', 'Experiment', experimentName, undefined, {
    variant: variant,
  });
};

// Initialize on load
if (typeof window !== 'undefined') {
  initGA();
}