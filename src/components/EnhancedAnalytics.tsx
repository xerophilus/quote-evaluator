"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackTrafficSource, trackFunnelStep } from '@/lib/ga4-config';
import { hotjar } from '@/components/HotjarProvider';
import { getUserExperiments } from '@/lib/ab-testing';

export default function EnhancedAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track traffic source on first load
    trackTrafficSource();
    
    // Initialize user experiments
    getUserExperiments();
    
    // Track page view in all systems
    if (typeof window !== 'undefined') {
      // GA4 page view
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: pathname,
          page_search: searchParams.toString(),
          page_title: document.title,
        });
      }
      
      // Hotjar page view
      hotjar.trackPageView(pathname);
      
      // Track funnel position
      trackFunnelPosition(pathname);
    }
  }, [pathname, searchParams]);

  // Track funnel position based on URL
  const trackFunnelPosition = (path: string) => {
    let step = 0;
    let stepName = '';
    
    if (path === '/') {
      step = 1;
      stepName = 'Landing Page';
    } else if (path.includes('kitchen') || path.includes('bathroom') || path.includes('roofing')) {
      step = 1;
      stepName = 'Project Landing';
    } else if (path === '/dashboard') {
      step = 4;
      stepName = 'Dashboard';
    } else if (path === '/success') {
      step = 5;
      stepName = 'Payment Success';
    }
    
    if (step > 0) {
      trackFunnelStep(step, stepName, 'main_conversion');
    }
  };

  // Track user engagement
  useEffect(() => {
    let startTime = Date.now();
    let scrollDepth = 0;
    let interactionCount = 0;
    
    // Track scroll depth
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
      
      if (scrollPercentage > scrollDepth) {
        scrollDepth = scrollPercentage;
        
        // Track milestones
        if (scrollDepth >= 25 && scrollDepth < 50) {
          window.gtag?.('event', 'scroll_milestone', { depth: '25%' });
        } else if (scrollDepth >= 50 && scrollDepth < 75) {
          window.gtag?.('event', 'scroll_milestone', { depth: '50%' });
        } else if (scrollDepth >= 75 && scrollDepth < 90) {
          window.gtag?.('event', 'scroll_milestone', { depth: '75%' });
        } else if (scrollDepth >= 90) {
          window.gtag?.('event', 'scroll_milestone', { depth: '90%' });
        }
      }
    };
    
    // Track interactions
    const handleInteraction = (e: MouseEvent) => {
      interactionCount++;
      
      // Track rage clicks (multiple clicks in same area)
      if (interactionCount > 5) {
        const target = e.target as HTMLElement;
        if (target) {
          hotjar.trackFrustration('rage_click', target.className);
        }
      }
    };
    
    // Track time on page
    const handleUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      
      if (window.gtag) {
        window.gtag('event', 'engagement', {
          engagement_time_msec: timeOnPage * 1000,
          scroll_depth: scrollDepth,
          interaction_count: interactionCount,
        });
      }
      
      // Store session data
      sessionStorage.setItem('time_on_site', 
        String(parseInt(sessionStorage.getItem('time_on_site') || '0') + timeOnPage)
      );
      sessionStorage.setItem('pages_viewed', 
        String(parseInt(sessionStorage.getItem('pages_viewed') || '0') + 1)
      );
    };
    
    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [pathname]);

  // Track form interactions
  useEffect(() => {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const formName = form.getAttribute('data-form-name') || 'unknown';
      
      // Track form start
      form.addEventListener('focusin', () => {
        hotjar.trackFormInteraction(formName, 'start');
        window.gtag?.('event', 'form_start', { form_name: formName });
      });
      
      // Track form submit
      form.addEventListener('submit', () => {
        hotjar.trackFormInteraction(formName, 'complete');
        window.gtag?.('event', 'form_submit', { form_name: formName });
      });
    });
  }, [pathname]);

  return null;
}