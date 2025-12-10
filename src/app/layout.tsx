import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import Header from "@/components/Header";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import HotjarProvider from "@/components/HotjarProvider";
import EnhancedAnalytics from "@/components/EnhancedAnalytics";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuoteEvaluator.com - AI-Powered Contractor Quote Analysis",
  description: "Get plain English explanations of contractor quotes with smart cost comparisons and red flag detection for kitchen renovation, bathroom remodels, and more.",
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="%233B82F6" stroke-width="4"/><circle cx="50" cy="50" r="35" fill="%233B82F6"/><rect x="35" y="28" width="30" height="36" rx="3" fill="white"/><line x1="40" y1="35" x2="55" y2="35" stroke="%23E5E7EB" stroke-width="1.5" stroke-linecap="round"/><line x1="40" y1="40" x2="60" y2="40" stroke="%23E5E7EB" stroke-width="1.5" stroke-linecap="round"/><line x1="40" y1="45" x2="58" y2="45" stroke="%23E5E7EB" stroke-width="1.5" stroke-linecap="round"/><path d="m42 52 3 3 8-8" stroke="%233B82F6" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="%233B82F6" stroke-width="4"/><circle cx="50" cy="50" r="35" fill="%233B82F6"/><rect x="35" y="28" width="30" height="36" rx="3" fill="white"/><line x1="40" y1="35" x2="55" y2="35" stroke="%23E5E7EB" stroke-width="1.5" stroke-linecap="round"/><line x1="40" y1="40" x2="60" y2="40" stroke="%23E5E7EB" stroke-width="1.5" stroke-linecap="round"/><line x1="40" y1="45" x2="58" y2="45" stroke="%23E5E7EB" stroke-width="1.5" stroke-linecap="round"/><path d="m42 52 3 3 8-8" stroke="%233B82F6" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-997581352"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-997581352', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true
            });

            // Track page engagement time
            let startTime = Date.now();
            let engagementTime = 0;
            let isEngaged = true;

            // Track when user becomes engaged/disengaged
            document.addEventListener('visibilitychange', function() {
              if (document.hidden) {
                if (isEngaged) {
                  engagementTime += Date.now() - startTime;
                  gtag('event', 'page_engagement', {
                    engagement_time_msec: Date.now() - startTime
                  });
                }
                isEngaged = false;
              } else {
                startTime = Date.now();
                isEngaged = true;
                gtag('event', 'page_view_resumed');
              }
            });

            // Track engagement on page unload
            window.addEventListener('beforeunload', function() {
              if (isEngaged) {
                engagementTime += Date.now() - startTime;
                gtag('event', 'page_engagement', {
                  engagement_time_msec: engagementTime
                });
              }
            });

            // Track scroll depth
            let maxScroll = 0;
            window.addEventListener('scroll', function() {
              const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
              if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (scrollPercent >= 25 && scrollPercent < 50) {
                  gtag('event', 'scroll', { scroll_depth: '25%' });
                } else if (scrollPercent >= 50 && scrollPercent < 75) {
                  gtag('event', 'scroll', { scroll_depth: '50%' });
                } else if (scrollPercent >= 75 && scrollPercent < 90) {
                  gtag('event', 'scroll', { scroll_depth: '75%' });
                } else if (scrollPercent >= 90) {
                  gtag('event', 'scroll', { scroll_depth: '90%' });
                }
              }
            });
          `}
        </Script>

        <script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="ba5e0f09-6ce2-4810-af31-71cd833f37d2" type="text/javascript" async></script>

        <ErrorBoundary>
          <AnalyticsProvider>
            <HotjarProvider />
            <EnhancedAnalytics />
            <Header />
            {children}
          </AnalyticsProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
