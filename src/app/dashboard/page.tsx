"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { SavedQuote } from "@/lib/firestore";

interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  email: string;
  subscriptionInfo?: {
    id: string;
    status: string;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionInfo>({
    hasActiveSubscription: false,
    email: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for subscription email in localStorage
        const subscriberEmail = localStorage.getItem('pro_subscription_email');
        
        if (subscriberEmail) {
          // Set user email immediately for faster UI
          setUserEmail(subscriberEmail);
          setSubscriptionStatus({
            hasActiveSubscription: false, // Default to false, update if verified
            email: subscriberEmail,
          });
          
          // Verify subscription status asynchronously (non-blocking)
          fetch('/api/check-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: subscriberEmail }),
          })
          .then(response => response.ok ? response.json() : null)
          .then(data => {
            if (data?.hasActiveSubscription) {
              setSubscriptionStatus({
                hasActiveSubscription: true,
                email: subscriberEmail,
                subscriptionInfo: data.subscriptionInfo
              });
              
              // Track dashboard access
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'dashboard_page_view', {
                  event_category: 'engagement',
                  event_label: 'subscriber_dashboard',
                  subscriber_email: subscriberEmail
                });
              }
            }
          })
          .catch(error => console.warn('Subscription check failed:', error));
        } else {
          // No email found - allow anonymous dashboard access immediately
          setUserEmail('anonymous');
          setSubscriptionStatus({
            hasActiveSubscription: false,
            email: '',
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // On error, still allow dashboard access as anonymous
        setUserEmail('anonymous');
        setSubscriptionStatus({
          hasActiveSubscription: false,
          email: '',
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Handle loading a quote (navigate back to main app)
  const handleLoadQuote = (quote: SavedQuote) => {
    // Store the quote data in localStorage for the main app to pick up
    const quoteId = `dashboard_load_${Date.now()}`;
    localStorage.setItem(`quote_data_${quoteId}`, JSON.stringify(quote.quoteData));
    localStorage.setItem(`analysis_result_${quoteId}`, JSON.stringify(quote.analysisResult));
    
    // Navigate to main app with parameters to load the quote
    router.push(`/?pro=true&quote_id=${quoteId}&step=3`);
  };

  // Handle creating a new quote analysis
  const handleCreateNewQuote = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Dashboard is now accessible to all users, no restriction needed

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Dashboard
        userEmail={userEmail}
        subscriptionStatus={subscriptionStatus}
        onLoadQuote={handleLoadQuote}
        onCreateNewQuote={handleCreateNewQuote}
      />
    </div>
  );
} 