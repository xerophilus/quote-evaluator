"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { trackClick, trackPayment } from '@/lib/analytics';

interface RepeatPurchaseProps {
  onPurchase: () => void;
  analysisType: 'free' | 'pro' | 'subscription' | 'lifetime';
  hasUsedFreeQuote: boolean;
  className?: string;
}

export default function RepeatPurchase({ 
  onPurchase, 
  analysisType, 
  hasUsedFreeQuote,
  className = '' 
}: RepeatPurchaseProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    trackClick.cta('repeat_purchase', 'quick_action');
    trackPayment.checkoutStart('single', 4.99);
    
    try {
      await onPurchase();
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't show for subscription users (they have unlimited)
  if (analysisType === 'subscription') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-full">
            <Plus className="h-6 w-6 text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Analyze Another Quote
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              Compare multiple contractors or get a second opinion
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Full Pro Analysis</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                <Zap className="h-3 w-3" />
                <span>Same Great Features</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-2xl font-bold text-blue-600">$4.99</span>
            <span className="text-sm text-gray-500 line-through">$9.99</span>
          </div>
          <div className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded">
            50% off repeat
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Popular use cases:</span>
            <div className="mt-1 space-x-1">
              <span className="inline-block bg-white px-2 py-1 rounded text-xs">Compare bids</span>
              <span className="inline-block bg-white px-2 py-1 rounded text-xs">Second opinion</span>
              <span className="inline-block bg-white px-2 py-1 rounded text-xs">Different project</span>
            </div>
          </div>
          
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center space-x-2 min-w-[140px] justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Analyze Now</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Social Proof */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          💡 <strong>Pro Tip:</strong> Most homeowners analyze 2-3 quotes before choosing a contractor
        </p>
      </div>
    </motion.div>
  );
}