"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, User, Menu, X, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Logo from './Logo';
import Modal from './Modal';

interface SubscriptionStatus {
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

export default function Header() {
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    email: '',
  });
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = () => {
      try {
        const subscriberEmail = localStorage.getItem('pro_subscription_email');
        
        if (subscriberEmail) {
          setSubscriptionStatus({
            hasActiveSubscription: true, // We'll verify this via API
            email: subscriberEmail,
          });
          
          // Verify subscription status (non-blocking)
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
            } else {
              // Invalid subscription, clear it
              localStorage.removeItem('pro_subscription_email');
              setSubscriptionStatus({
                hasActiveSubscription: false,
                email: '',
              });
            }
          })
          .catch(error => {
            console.warn('Subscription check failed:', error);
            // Keep the subscription status as-is on error
          });
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, []);

  const clearSubscription = () => {
    localStorage.removeItem('pro_subscription_email');
    setSubscriptionStatus({
      hasActiveSubscription: false,
      email: '',
    });
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hasActiveSubscription) {
          localStorage.setItem('pro_subscription_email', email);
          setSubscriptionStatus({
            hasActiveSubscription: true,
            email: email,
            subscriptionInfo: data.subscriptionInfo
          });
          setShowEmailInput(false);
          setMobileMenuOpen(false);
          setEmailInput('');
          // Success - subscription verified
        } else {
          // No active subscription found
          console.error('No active subscription found');
        }
      } else {
        console.error('Error checking subscription');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  return (
    <>
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <Logo size={32} className="text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                QuoteEvaluator.com
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              <Link 
                href="/#how-it-works" 
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 hover:underline underline-offset-4"
              >
                How it Works
              </Link>
              <Link
                href="/#pricing"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 hover:underline underline-offset-4"
              >
                Pricing
              </Link>
              <Link
                href="/guides"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 hover:underline underline-offset-4"
              >
                Cost Guides
              </Link>
              
              {/* Dashboard Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'dashboard_access', {
                      event_category: 'navigation',
                      event_label: subscriptionStatus.hasActiveSubscription ? 'subscriber_dashboard' : 'free_dashboard'
                    });
                  }
                  router.push('/dashboard');
                }}
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200 hover:underline underline-offset-4 flex items-center space-x-1"
              >
                <User className="h-4 w-4" />
                <span>Dashboard</span>
              </motion.button>
              
              {/* Subscription Status */}
              {subscriptionStatus.hasActiveSubscription ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg px-4 py-2 shadow-sm"
                >
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                      Pro Subscriber
                    </span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-300">
                      {subscriptionStatus.email}
                    </span>
                  </div>
                  <button
                    onClick={clearSubscription}
                    className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200 text-sm ml-2"
                    title="Clear subscription"
                  >
                    ×
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEmailInput(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1 hover:underline"
                >
                  <Crown className="h-4 w-4" />
                  <span>Have a subscription?</span>
                </motion.button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="py-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                  <Link 
                    href="/#how-it-works"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                  >
                    How it Works
                  </Link>
                  <Link
                    href="/#pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/guides"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                  >
                    Cost Guides
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/dashboard');
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                  
                  {/* Mobile Subscription Status */}
                  {subscriptionStatus.hasActiveSubscription ? (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Crown className="h-5 w-5 text-yellow-600" />
                        <div>
                          <div className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                            Pro Subscriber
                          </div>
                          <div className="text-xs text-yellow-600 dark:text-yellow-300">
                            {subscriptionStatus.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          clearSubscription();
                          setMobileMenuOpen(false);
                        }}
                        className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
                      >
                        Clear subscription
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowEmailInput(true)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <Crown className="h-4 w-4" />
                      <span>Have a subscription?</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Email Input Modal */}
      <Modal
        isOpen={showEmailInput}
        onClose={() => {
          setShowEmailInput(false);
          setEmailInput('');
        }}
        title="Pro Subscription Verification"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Enter your Pro subscriber email to access unlimited features.
          </p>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (emailInput) {
                handleEmailSubmit(emailInput);
              }
            }}
            className="space-y-4"
          >
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
                autoFocus
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!emailInput.includes('@')}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              Verify Subscription
            </motion.button>
          </form>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Don&apos;t have a subscription? <Link href="/#pricing" className="text-blue-600 hover:underline">View pricing</Link>
          </p>
        </div>
      </Modal>
    </>
  );
}