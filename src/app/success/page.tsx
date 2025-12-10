"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Crown } from 'lucide-react';
import { trackPayment, trackConversion } from '@/lib/analytics';

// gtag types are defined in analytics.ts

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const quoteId = searchParams.get('quote_id');
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [isSubscription, setIsSubscription] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string>('');

  const verifyPayment = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.paymentStatus === 'paid') {
          setPaymentStatus('success');
          setIsSubscription(data.isSubscription);
          setCustomerEmail(data.customerEmail || '');
          
          // Track successful purchase conversion with comprehensive analytics
          const paymentType = data.isSubscription ? 'subscription' : 'single';
          const value = data.isSubscription ? 9.99 : 4.99;
          
          trackPayment.checkoutComplete(paymentType, value, sessionId);
          
          if (data.isSubscription) {
            // For subscriptions, store the customer email for unlimited access
            localStorage.setItem('pro_subscription_email', data.customerEmail);
            localStorage.setItem('pro_subscription_info', JSON.stringify(data.subscriptionInfo));
            trackConversion.subscription(9.99);
          } else {
            // For single payments, store access for this specific quote
            localStorage.setItem(`pro_access_${quoteId}`, 'true');
            trackConversion.proAnalysis(4.99);
          }
        } else {
          setPaymentStatus('error');
        }
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('error');
    }
  }, [quoteId]);

  useEffect(() => {
    if (sessionId) {
      // Verify payment status
      verifyPayment(sessionId);
    }
  }, [sessionId, verifyPayment]);

  const goToAnalysis = () => {
    // Track analysis button click from success page
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'success_to_analysis', {
        'event_category': 'user_action',
        'event_label': isSubscription ? 'subscription' : 'single_purchase',
        'quote_id': quoteId
      });
    }
    
    window.location.href = `/?quote_id=${quoteId}&pro=true&step=3`;
  };

  const goToHome = () => {
    // Track return home button click from success page
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'success_to_home', {
        'event_category': 'user_action',
        'event_label': isSubscription ? 'subscription' : 'single_purchase',
        'quote_id': quoteId
      });
    }
    
    window.location.href = '/';
  };

  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Verification Failed</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            There was an issue verifying your payment. Please contact support if you were charged.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          {isSubscription ? (
            <Crown className="h-8 w-8 text-yellow-600" />
          ) : (
            <CheckCircle className="h-8 w-8 text-green-600" />
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {isSubscription ? 'Welcome to Pro Subscription!' : 'Payment Successful!'}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {isSubscription ? (
            <>
              You now have <strong>unlimited access</strong> to QuoteEvaluator Pro! 
              Analyze as many quotes as you want with all premium features.
            </>
          ) : (
            <>
              Welcome to QuoteEvaluator Pro! You now have access to advanced analysis features 
              for this quote including red flags, cost comparisons, and smart questions.
            </>
          )}
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {isSubscription ? 'Subscription Includes:' : 'What\'s Included:'}
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>✅ Red flag detection</li>
            <li>✅ Cost comparison analysis</li>
            <li>✅ Smart questions to ask</li>
            <li>✅ Quote health score</li>
            <li>✅ Detailed analysis report</li>
            {isSubscription && <li>✅ <strong>Unlimited quotes</strong></li>}
          </ul>
        </div>

        {isSubscription && customerEmail && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              📧 Your subscription is linked to: <strong>{customerEmail}</strong>
              <br />
              <span className="text-xs opacity-75">
                Use this email to access your subscription on any device.
              </span>
            </p>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <button
            onClick={goToAnalysis}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>
              {isSubscription ? 'Start Analyzing (Unlimited)' : 'View Your Pro Analysis'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={goToHome}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {isSubscription ? 'Analyze Another Quote' : 'Return Home'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
} 