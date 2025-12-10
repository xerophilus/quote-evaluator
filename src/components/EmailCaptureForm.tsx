'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Download, CheckCircle, X, AlertCircle, Gift } from 'lucide-react';
import { trackConversion, trackEngagement, trackEmail } from '@/lib/analytics';

interface EmailCaptureFormProps {
  source: 'popup' | 'inline' | 'exit_intent';
  onClose?: () => void;
  isModal?: boolean;
}

export default function EmailCaptureForm({ source, onClose, isModal = false }: EmailCaptureFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // Track email signup attempt
      trackEmail.signupAttempt(source);
      trackEngagement.formInteraction('email_capture', source);

      const response = await fetch('/api/email-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          source,
          leadMagnet: 'contractor_checklist',
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        
        // Track successful email signup
        trackEmail.signupSuccess(email, source, 'contractor_checklist');
        trackConversion.emailSignup(email, source);
        
        // Store in localStorage for discount application
        localStorage.setItem('email_discount', '20');
        localStorage.setItem('discount_email', email);
        
        // If checklist URL is returned, trigger download
        if (data.checklistUrl) {
          trackEmail.checklistDownload(email, source);
          setTimeout(() => {
            window.open(data.checklistUrl, '_blank');
          }, 1000);
        }
        
        // Close modal after success if it's a modal
        if (isModal && onClose) {
          setTimeout(() => {
            onClose();
          }, 3000);
        }
      } else {
        setStatus('error');
        const errorMsg = data.error || 'Something went wrong. Please try again.';
        setErrorMessage(errorMsg);
        trackEmail.signupError(source, errorMsg);
      }
    } catch (error) {
      console.error('Email signup error:', error);
      const errorMsg = 'Network error. Please check your connection and try again.';
      setStatus('error');
      setErrorMessage(errorMsg);
      trackEmail.signupError(source, errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormContent = () => (
    <div className={`${isModal ? 'p-6' : 'p-4'}`}>
      {status !== 'success' ? (
        <>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-4">
              <Gift className="h-8 w-8 text-blue-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Get Your FREE Contractor Red Flags Checklist
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Plus get <span className="font-bold text-green-600">20% OFF</span> your first quote analysis!
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                🎁 <strong>Limited Time Offer:</strong> Save an average of $3,000+ on your next project
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {status === 'error' && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Get Free Checklist + 20% OFF</span>
                </>
              )}
            </motion.button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              🔒 We respect your privacy. Unsubscribe at any time.
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">15+</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Red Flags</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">$3K+</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Savings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">2 Min</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Quick Read</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Success! Check Your Email
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We've sent your <strong>FREE Contractor Red Flags Checklist</strong> to:
          </p>
          
          <p className="font-semibold text-blue-600 mb-4">{email}</p>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
              🎉 Your 20% discount has been activated!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Use it on your next quote analysis within 7 days
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            )}
            <FormContent />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <FormContent />
    </div>
  );
}