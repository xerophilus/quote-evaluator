"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Crown, ArrowRight, Clock, CheckCircle, 
  X, Star, Zap, TrendingUp, Users
} from 'lucide-react';
import { trackPayment, trackClick, trackRevenue } from '@/lib/analytics';
import { hotjar } from '@/components/HotjarProvider';

interface PostPurchaseUpsellProps {
  isOpen: boolean;
  onClose: () => void;
  purchasedType: 'pro' | 'subscription';
  purchaseAmount: number;
  customerEmail: string;
  onUpsellPurchase: (upsellType: 'additional_quote' | 'pro_plus', price: number) => void;
}

export default function PostPurchaseUpsell({
  isOpen,
  onClose,
  purchasedType,
  purchaseAmount,
  customerEmail,
  onUpsellPurchase
}: PostPurchaseUpsellProps) {
  const [selectedUpsell, setSelectedUpsell] = useState<'additional' | 'proplus' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [showTimer, setShowTimer] = useState(true);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setShowTimer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Track upsell shown
  useEffect(() => {
    if (isOpen) {
      trackRevenue.upsellModalShown(purchasedType, 0);
      hotjar.trackEvent('post_purchase_upsell_shown');
      hotjar.tagRecording(['post_purchase_upsell', purchasedType]);
    }
  }, [isOpen, purchasedType]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpsellSelect = async (upsellType: 'additional' | 'proplus') => {
    setIsProcessing(true);
    
    const price = upsellType === 'additional' ? 3.99 : 9.99;
    const trackingType = upsellType === 'additional' ? 'additional_quote' : 'pro_plus';
    
    trackClick.cta(`upsell_${trackingType}`, 'post_purchase');
    trackPayment.checkoutStart('single', price);
    hotjar.trackEvent(`upsell_${trackingType}_clicked`);
    
    try {
      await onUpsellPurchase(trackingType, price);
      
      // Track successful upsell
      trackRevenue.repeatPurchaseClicked(purchasedType);
      hotjar.trackEvent('upsell_purchase_success');
      
    } catch (error) {
      console.error('Upsell purchase failed:', error);
      hotjar.trackFrustration('error_message', 'upsell_failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    trackRevenue.upsellModalDismissed(purchasedType, 600 - timeRemaining);
    hotjar.trackEvent('post_purchase_upsell_dismissed');
    onClose();
  };

  // Don't show upsell for subscription purchases
  if (purchasedType === 'subscription') {
    return null;
  }

  const getDiscountedPrice = (originalPrice: number) => {
    return (originalPrice * 0.8).toFixed(2); // 20% discount
  };

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative">
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 text-white hover:text-gray-200 p-2"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment Successful! 🎉</h2>
                <p className="text-green-100">
                  You've just saved yourself from potential overcharges. Great choice!
                </p>
              </div>
            </div>

            {/* Timer Bar */}
            {showTimer && (
              <div className="bg-orange-50 border-b border-orange-200 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-orange-800">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-semibold">Special Offer Expires In:</span>
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
                <div className="mt-2 bg-orange-200 rounded-full h-2">
                  <motion.div 
                    className="bg-orange-500 h-2 rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeRemaining / 600) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Success Message */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Want to maximize your savings?
                </h3>
                <p className="text-gray-600">
                  Since you're already saving money, here are two exclusive offers just for you:
                </p>
              </div>

              {/* Upsell Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Additional Quote Analysis */}
                <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedUpsell === 'additional' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}>
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Plus className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Analyze Another Quote
                    </h4>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-2xl font-bold text-blue-600">
                          ${getDiscountedPrice(3.99)}
                        </span>
                        <span className="text-lg text-gray-400 line-through">$4.99</span>
                      </div>
                      <p className="text-sm text-green-600 font-semibold">Save 20%!</p>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      Perfect for comparing multiple contractor bids
                    </p>
                    
                    <ul className="text-xs text-gray-500 space-y-1 mb-4">
                      <li>✓ Full pro analysis features</li>
                      <li>✓ Cost comparison & red flags</li>
                      <li>✓ Smart negotiation questions</li>
                    </ul>
                    
                    <button
                      onClick={() => handleUpsellSelect('additional')}
                      disabled={isProcessing}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Add to Order</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Pro+ Subscription */}
                <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all relative ${
                  selectedUpsell === 'proplus' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      BEST VALUE
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Crown className="h-8 w-8 text-purple-600" />
                    </div>
                    
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Upgrade to Pro+
                    </h4>
                    
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-purple-600">
                        $9.99<span className="text-sm font-normal">/month</span>
                      </div>
                      <p className="text-sm text-green-600 font-semibold">Unlimited quotes!</p>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      Unlimited quote analyses + premium features
                    </p>
                    
                    <ul className="text-xs text-gray-500 space-y-1 mb-4">
                      <li>✓ Unlimited quote analyses</li>
                      <li>✓ Save quotes to dashboard</li>
                      <li>✓ Priority customer support</li>
                      <li>✓ Cancel anytime</li>
                    </ul>
                    
                    <button
                      onClick={() => handleUpsellSelect('proplus')}
                      disabled={isProcessing}
                      className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Crown className="h-4 w-4" />
                      <span>Upgrade Now</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4 mb-3">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-semibold">50,000+ Users</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-semibold">4.9/5 Rating</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-semibold">$2,847 Avg Saved</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    "Used QuoteEvaluator for 3 different projects. Saved thousands!" - Sarah M.
                  </p>
                </div>
              </div>

              {/* No Thanks Option */}
              <div className="text-center">
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  No thanks, I'll continue to my analysis
                </button>
              </div>
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-2xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing your upgrade...</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}