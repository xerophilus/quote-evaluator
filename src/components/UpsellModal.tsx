"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, CheckCircle, ArrowRight, Zap, TrendingUp, Shield } from 'lucide-react';
import { trackPayment, trackClick, trackRevenue } from '@/lib/analytics';

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planType: 'proplus' | 'repeat' | 'lifetime') => void;
  analysisType: 'free' | 'pro' | 'subscription' | 'lifetime';
  currentQuoteId?: string;
}

export default function UpsellModal({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  analysisType,
  currentQuoteId 
}: UpsellModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalStartTime] = useState(Date.now());

  const handleUpgrade = async (planType: 'proplus' | 'repeat' | 'lifetime') => {
    setIsProcessing(true);
    
    // Track upsell click
    trackClick.cta(`upsell_${planType}`, 'post_analysis');
    trackPayment.checkoutStart(
      planType === 'proplus' ? 'subscription' : 'single', 
      planType === 'proplus' ? 9.99 : 4.99
    );
    
    try {
      await onUpgrade(planType);
    } finally {
      setIsProcessing(false);
    }
  };

  // Track modal close
  const handleClose = () => {
    const timeVisible = Math.round((Date.now() - modalStartTime) / 1000);
    trackRevenue.upsellModalDismissed(analysisType, timeVisible);
    onClose();
  };

  // Don't show upsell to existing Pro+ subscribers or Lifetime users
  if (analysisType === 'subscription' || analysisType === 'lifetime') {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-full">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Great analysis! Want more?
                    </h2>
                    <p className="text-gray-600">
                      {analysisType === 'free' 
                        ? 'Upgrade to unlock premium features' 
                        : 'Get even more value with Pro+'
                      }
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {/* Pro+ Subscription Option */}
                <div className="border-2 border-purple-200 bg-purple-50 rounded-xl p-6 relative">
                  <div className="absolute -top-3 left-6 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                        <Crown className="h-5 w-5 text-purple-600 mr-2" />
                        Pro+ Monthly
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Analyze 2 more quotes this month + unlimited future quotes
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>2 bonus quote analyses this month</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>Unlimited quotes starting next month</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>Save quotes to dashboard</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>Priority customer support</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>Cancel anytime</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className="text-3xl font-bold text-purple-600">$9.99</div>
                      <div className="text-sm text-gray-500">/month</div>
                      <div className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded mt-1">
                        Save $4.98
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleUpgrade('proplus')}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                  >
                    <Crown className="h-5 w-5" />
                    <span>Upgrade to Pro+</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* One-time Purchase Option */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                        <Zap className="h-5 w-5 text-blue-600 mr-2" />
                        Analyze One More Quote
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Perfect for comparing multiple contractor bids
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>1 additional pro analysis</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>Full red flags & cost breakdown</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>Smart questions to ask contractors</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className="text-3xl font-bold text-blue-600">$4.99</div>
                      <div className="text-sm text-gray-500">one-time</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleUpgrade('repeat')}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Zap className="h-5 w-5" />
                    <span>Analyze Another Quote</span>
                  </button>
                </div>

                {/* Social Proof */}
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-green-500 mr-1" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                      <span>Average $2,847 Saved</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Join thousands of homeowners who&apos;ve saved money with our analysis
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  No thanks, I'll continue with my current plan
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}