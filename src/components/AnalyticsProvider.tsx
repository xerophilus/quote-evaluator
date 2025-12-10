'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, startSession, endSession, trackEngagement } from '@/lib/analytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Start session tracking
    startSession();

    // Track engagement metrics
    let startTime = Date.now();
    let maxScroll = 0;

    // Track scroll depth
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (scrollPercent >= 25 && scrollPercent < 50) {
          trackEngagement.scrollDepth(25);
        } else if (scrollPercent >= 50 && scrollPercent < 75) {
          trackEngagement.scrollDepth(50);
        } else if (scrollPercent >= 75 && scrollPercent < 90) {
          trackEngagement.scrollDepth(75);
        } else if (scrollPercent >= 90) {
          trackEngagement.scrollDepth(90);
        }
      }
    };

    // Track time on page
    const handleBeforeUnload = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackEngagement.timeOnPage(timeSpent);
      endSession();
    };

    // Track page visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        trackEngagement.timeOnPage(timeSpent);
      } else {
        startTime = Date.now();
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Cleanup
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Track final time
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackEngagement.timeOnPage(timeSpent);
    };
  }, []);

  useEffect(() => {
    // Track page views - get search params from window if available
    const searchParams = typeof window !== 'undefined' ? window.location.search : '';
    const url = pathname + searchParams;
    trackPageView(url);
  }, [pathname]);

  return <>{children}</>;
}