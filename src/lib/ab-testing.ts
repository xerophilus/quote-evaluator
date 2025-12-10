// A/B Testing Framework for QuoteEvaluator

interface Experiment {
  id: string;
  name: string;
  variants: Array<{
    id: string;
    name: string;
    weight: number; // Percentage of traffic (0-100)
    value: any;
  }>;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

// Active experiments configuration
export const EXPERIMENTS: Record<string, Experiment> = {
  PRICING_TEST: {
    id: 'pricing_test_v1',
    name: 'Pro Analysis Pricing Test',
    isActive: true,
    startDate: '2024-01-01',
    variants: [
      { id: 'control', name: '$4.99 Price', weight: 50, value: 4.99 },
      { id: 'variant_a', name: '$7.99 Price', weight: 25, value: 7.99 },
      { id: 'variant_b', name: '$9.99 Price', weight: 25, value: 9.99 },
    ]
  },
  
  BUTTON_COLOR: {
    id: 'button_color_v1',
    name: 'CTA Button Color Test',
    isActive: true,
    startDate: '2024-01-01',
    variants: [
      { id: 'control', name: 'Blue Button', weight: 33, value: 'bg-blue-600 hover:bg-blue-700' },
      { id: 'variant_a', name: 'Green Button', weight: 33, value: 'bg-green-600 hover:bg-green-700' },
      { id: 'variant_b', name: 'Orange Button', weight: 34, value: 'bg-orange-600 hover:bg-orange-700' },
    ]
  },
  
  BUTTON_TEXT: {
    id: 'button_text_v1',
    name: 'CTA Button Text Test',
    isActive: true,
    startDate: '2024-01-01',
    variants: [
      { id: 'control', name: 'Get Pro Analysis', weight: 25, value: 'Get Pro Analysis' },
      { id: 'variant_a', name: 'Unlock Full Report', weight: 25, value: 'Unlock Full Report' },
      { id: 'variant_b', name: 'See Hidden Savings', weight: 25, value: 'See Hidden Savings' },
      { id: 'variant_c', name: 'Get Instant Analysis', weight: 25, value: 'Get Instant Analysis' },
    ]
  },
  
  HEADLINE: {
    id: 'headline_v1',
    name: 'Main Headline Test',
    isActive: true,
    startDate: '2024-01-01',
    variants: [
      { 
        id: 'control', 
        name: 'Original', 
        weight: 25, 
        value: 'Stop Overpaying Contractors – Get Your Quote Analyzed by AI'
      },
      { 
        id: 'variant_a', 
        name: 'Save Money Focus', 
        weight: 25, 
        value: 'Save $2,847 on Average – AI Quote Analysis in 60 Seconds'
      },
      { 
        id: 'variant_b', 
        name: 'Trust Focus', 
        weight: 25, 
        value: 'Is Your Contractor Overcharging? Find Out in 60 Seconds'
      },
      { 
        id: 'variant_c', 
        name: 'Urgency Focus', 
        weight: 25, 
        value: 'Don\'t Sign That Quote! Get Free AI Analysis First'
      },
    ]
  },
  
  FREE_TIER_VISIBILITY: {
    id: 'free_tier_v1',
    name: 'Free Tier Visibility Test',
    isActive: true,
    startDate: '2024-01-01',
    variants: [
      { id: 'control', name: 'Hide Free Option', weight: 50, value: false },
      { id: 'variant_a', name: 'Show Free Option', weight: 50, value: true },
    ]
  },
  
  SOCIAL_PROOF_PLACEMENT: {
    id: 'social_proof_v1',
    name: 'Social Proof Placement',
    isActive: true,
    startDate: '2024-01-01',
    variants: [
      { id: 'control', name: 'Below Hero', weight: 50, value: 'below_hero' },
      { id: 'variant_a', name: 'In Hero', weight: 50, value: 'in_hero' },
    ]
  },
  
  URGENCY_MESSAGING: {
    id: 'urgency_v1',
    name: 'Urgency Messaging Test',
    isActive: true,
    startDate: '2024-01-01',
    variants: [
      { id: 'control', name: 'No Urgency', weight: 33, value: null },
      { id: 'variant_a', name: 'Time Limited', weight: 33, value: 'Limited time: 50% off ends tonight!' },
      { id: 'variant_b', name: 'Spots Limited', weight: 34, value: 'Only 3 spots left at this price!' },
    ]
  }
};

// Get or create user's experiment assignments
export const getUserExperiments = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  
  let experiments: Record<string, string> = {};
  const stored = localStorage.getItem('ab_experiments');
  
  if (stored) {
    experiments = JSON.parse(stored);
  } else {
    // Assign user to experiments
    Object.entries(EXPERIMENTS).forEach(([key, experiment]) => {
      if (experiment.isActive) {
        const variant = selectVariant(experiment);
        experiments[key] = variant.id;
      }
    });
    
    localStorage.setItem('ab_experiments', JSON.stringify(experiments));
  }
  
  // Track assignments in analytics
  if (window.gtag) {
    Object.entries(experiments).forEach(([experimentKey, variantId]) => {
      window.gtag('event', 'experiment_impression', {
        experiment_id: EXPERIMENTS[experimentKey].id,
        variant_id: variantId,
      });
    });
  }
  
  return experiments;
};

// Select variant based on weights
const selectVariant = (experiment: Experiment) => {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (random <= cumulative) {
      return variant;
    }
  }
  
  return experiment.variants[0]; // Fallback to control
};

// Get specific experiment variant for a user
export const getExperimentVariant = (experimentKey: keyof typeof EXPERIMENTS) => {
  const experiments = getUserExperiments();
  const variantId = experiments[experimentKey];
  
  if (!variantId) return EXPERIMENTS[experimentKey].variants[0];
  
  const experiment = EXPERIMENTS[experimentKey];
  return experiment.variants.find(v => v.id === variantId) || experiment.variants[0];
};

// Track experiment conversion
export const trackExperimentConversion = (
  experimentKey: keyof typeof EXPERIMENTS,
  conversionType: 'click' | 'signup' | 'purchase' | 'analysis',
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const experiments = getUserExperiments();
  const variantId = experiments[experimentKey];
  
  if (!variantId) return;
  
  window.gtag('event', 'experiment_conversion', {
    experiment_id: EXPERIMENTS[experimentKey].id,
    variant_id: variantId,
    conversion_type: conversionType,
    value: value || 0,
  });
  
  // Also track in Hotjar if available
  if ((window as any).hj) {
    (window as any).hj('event', `experiment_${experimentKey}_${conversionType}`);
    (window as any).hj('tagRecording', [
      `experiment_${experimentKey}`,
      `variant_${variantId}`,
      `conversion_${conversionType}`
    ]);
  }
};

// React hook for using experiments
export const useExperiment = (experimentKey: keyof typeof EXPERIMENTS) => {
  if (typeof window === 'undefined') {
    return EXPERIMENTS[experimentKey].variants[0].value;
  }
  
  const variant = getExperimentVariant(experimentKey);
  return variant.value;
};

// Get all active experiment values for a component
export const useExperiments = () => {
  const experiments = getUserExperiments();
  const values: Record<string, any> = {};
  
  Object.keys(experiments).forEach((key) => {
    const variant = getExperimentVariant(key as keyof typeof EXPERIMENTS);
    values[key] = variant.value;
  });
  
  return values;
};

// Force specific variant (for testing)
export const forceVariant = (experimentKey: string, variantId: string) => {
  if (typeof window === 'undefined') return;
  
  const experiments = getUserExperiments();
  experiments[experimentKey] = variantId;
  localStorage.setItem('ab_experiments', JSON.stringify(experiments));
  
  // Reload to apply changes
  window.location.reload();
};

// Clear all experiment assignments (for testing)
export const clearExperiments = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('ab_experiments');
  window.location.reload();
};

// Export experiment results (for analysis)
export const exportExperimentData = () => {
  const experiments = getUserExperiments();
  const data = {
    user_id: localStorage.getItem('user_id') || 'anonymous',
    timestamp: new Date().toISOString(),
    experiments: experiments,
    conversions: JSON.parse(localStorage.getItem('experiment_conversions') || '{}'),
  };
  
  console.log('Experiment Data:', data);
  return data;
};