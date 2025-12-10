"use client";

import { useState, useEffect } from 'react';
import { 
  getExperimentVariant, 
  trackExperimentConversion,
  EXPERIMENTS
} from '@/lib/ab-testing';

type ExperimentKey = keyof typeof EXPERIMENTS;

export function useABTest(experimentKey: ExperimentKey) {
  const [variant, setVariant] = useState(() => {
    // Default to control variant for SSR
    return EXPERIMENTS[experimentKey].variants[0];
  });

  useEffect(() => {
    // Get actual variant on client side
    const userVariant = getExperimentVariant(experimentKey);
    setVariant(userVariant);
  }, [experimentKey]);

  const trackConversion = (
    conversionType: 'click' | 'signup' | 'purchase' | 'analysis',
    value?: number
  ) => {
    trackExperimentConversion(experimentKey, conversionType, value);
  };

  return {
    variant: variant.id,
    value: variant.value,
    trackConversion
  };
}

// Hook for multiple experiments at once
export function useABTests<T extends ExperimentKey[]>(experimentKeys: T) {
  const [variants, setVariants] = useState<Record<string, any>>(() => {
    // Default to control variants for SSR
    const defaults: Record<string, any> = {};
    experimentKeys.forEach(key => {
      defaults[key] = EXPERIMENTS[key].variants[0].value;
    });
    return defaults;
  });

  useEffect(() => {
    // Get actual variants on client side
    const userVariants: Record<string, any> = {};
    experimentKeys.forEach(key => {
      const variant = getExperimentVariant(key);
      userVariants[key] = variant.value;
    });
    setVariants(userVariants);
  }, [experimentKeys.join(',')]);

  return variants;
}