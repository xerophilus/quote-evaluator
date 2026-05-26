"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Lock, CreditCard, Clock, CheckCircle, 
  ArrowLeft, AlertCircle, Star,
  Smartphone, RefreshCw
} from 'lucide-react';
import { trackPayment, trackError, trackConversion } from '@/lib/analytics';
import { hotjar } from '@/components/HotjarProvider';

interface StreamlinedCheckoutProps {
  analysisType: 'pro' | 'subscription' | 'repeat';
  basePrice: number;
  quoteId: string;
  onBack: () => void;
  onSuccess: (sessionId: string) => void;
  userEmail?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
  available: boolean;
}

export default function StreamlinedCheckout({
  analysisType,
  basePrice,
  quoteId,
  onBack,
  onSuccess,
  userEmail = ''
}: StreamlinedCheckoutProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const [guestEmail, setGuestEmail] = useState(userEmail);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(!userEmail);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: userEmail,
    firstName: '',
    lastName: '',
    saveForFuture: false
  });

  // Calculate pricing
  const totalPrice = basePrice;

  // Payment methods available
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      available: true
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: Smartphone,
      description: 'Touch ID or Face ID',
      available: typeof window !== 'undefined' && 'ApplePaySession' in window
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      icon: Smartphone,
      description: 'Quick & secure',
      available: typeof window !== 'undefined' && 'google' in window
    }
  ];

  // Auto-save form data for cart recovery
  useEffect(() => {
    const saveData = {
      ...formData,
      analysisType,
      totalPrice,
      timestamp: Date.now(),
      quoteId
    };
    localStorage.setItem('checkout_draft', JSON.stringify(saveData));
  }, [formData, analysisType, totalPrice, quoteId]);

  // Load saved form data
  useEffect(() => {
    const saved = localStorage.getItem('checkout_draft');
    if (saved && !userEmail) {
      try {
        const savedData = JSON.parse(saved);
        if (savedData.quoteId === quoteId && Date.now() - savedData.timestamp < 3600000) { // 1 hour
          setFormData(prev => ({ ...prev, ...savedData }));
          setGuestEmail(savedData.email || '');
        }
      } catch (error) {
        console.error('Failed to load saved checkout data:', error);
      }
    }
  }, [quoteId, userEmail]);

  // Track checkout started
  useEffect(() => {
    trackPayment.checkoutStart(
      analysisType === 'subscription' ? 'subscription' : 'single',
      totalPrice
    );
    
    hotjar.trackEvent('checkout_started');
    hotjar.tagRecording(['checkout_started', analysisType]);
  }, [analysisType, totalPrice]);

  const handlePayment = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      hotjar.trackFrustration('error_message', 'invalid_email');
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Track payment method selection
    trackPayment.checkoutStart(
      analysisType === 'subscription' ? 'subscription' : 'single',
      totalPrice
    );

    try {
      // Create checkout session with all necessary data
      const checkoutData = {
        productType: analysisType,
        mode: analysisType === 'subscription' ? 'subscription' : 'payment',
        quoteId,
        customerEmail: formData.email,
        metadata: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          guest_checkout: !userEmail,
          payment_method: selectedPaymentMethod,
          total_price: totalPrice,
          base_price: basePrice,
        }
      };

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment processing failed');
      }

      const { url } = await response.json();

      // Track successful redirect
      trackConversion.proAnalysis(totalPrice);
      hotjar.trackEvent('payment_redirect_success');

      // Clear saved checkout data
      localStorage.removeItem('checkout_draft');

      // Redirect to Stripe
      window.location.href = url;

    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      
      // Track error
      trackError.payment(errorMessage);
      hotjar.trackFrustration('error_message', errorMessage);
      
      setIsProcessing(false);
    }
  };

  const getPriceDisplay = () => {
    switch (analysisType) {
      case 'subscription':
        return { main: '$9.99', period: '/month', description: 'Unlimited quotes' };
      case 'repeat':
        return { main: '$3.99', period: 'one-time', description: 'Additional quote' };
      default:
        return { main: `$${totalPrice.toFixed(2)}`, period: 'one-time', description: 'Pro analysis' };
    }
  };

  const priceDisplay = getPriceDisplay();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold">Secure Checkout</h2>
            <p className="text-blue-100">Get your analysis in 60 seconds</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <Lock className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Trust Badges */}
        <div className="flex items-center justify-center space-x-6 mb-6 pb-6 border-b">
          <div className="flex items-center space-x-2 text-green-600">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-semibold">SSL Secured</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-600">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-semibold">Instant Analysis</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">30-Day Guarantee</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {analysisType === 'subscription' ? 'Pro+ Monthly Subscription' :
                 analysisType === 'repeat' ? 'Additional Quote Analysis' :
                 'Pro Quote Analysis'}
              </span>
              <span className="font-semibold">${basePrice.toFixed(2)}</span>
            </div>
            
            <hr className="border-gray-200" />
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <div className="text-right">
                <div className="text-2xl text-blue-600">
                  {priceDisplay.main}
                  <span className="text-sm text-gray-500 ml-1">{priceDisplay.period}</span>
                </div>
                <div className="text-xs text-gray-500">{priceDisplay.description}</div>
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-green-600 mb-2">
                🎯 Average customer saves $2,847 on their project
              </p>
              <div className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Trusted by 50,000+ homeowners</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        {showGuestForm && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Contact Information</h3>
              <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                No account required
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              required
            />
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.saveForFuture}
                onChange={(e) => setFormData({...formData, saveForFuture: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-600">
                Save my info for faster checkout next time (optional)
              </span>
            </label>
          </div>
        )}

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
          
          <div className="space-y-3">
            {paymentMethods.filter(method => method.available).map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all ${
                  selectedPaymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <method.icon className={`h-6 w-6 ${
                    selectedPaymentMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                </div>
                
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedPaymentMethod === method.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedPaymentMethod === method.id && (
                    <CheckCircle className="w-3 h-3 text-white m-0.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {/* Money-back Guarantee */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-1">30-Day Money-Back Guarantee</h4>
              <p className="text-sm text-green-700">
                Not satisfied? Get a full refund within 30 days. We're confident you'll save more than you spend!
              </p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing || !formData.email}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              <span>Complete Secure Payment</span>
            </>
          )}
        </button>

        {/* Security Footer */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>🔒 256-bit SSL encryption</span>
            <span>•</span>
            <span>💳 PCI DSS compliant</span>
            <span>•</span>
            <span>🛡️ Fraud protected</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Powered by Stripe • Your payment info is never stored on our servers
          </p>
        </div>
      </div>
    </div>
  );
}