"use client";

import { useState } from 'react';
import Modal from './Modal';
import { Mail, Star, CheckCircle, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackEngagement, trackConversion, trackError } from '@/lib/analytics';

interface EmailSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  type?: 'free_analysis' | 'lead_magnet';
}

export default function EmailSignupModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title = "Get Your Free Quote Analysis",
  subtitle = "Enter your email to receive your detailed analysis",
  buttonText = "Get Free Analysis",
  type = 'free_analysis'
}: EmailSignupModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [checklistUrl, setChecklistUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    
    // Track signup with comprehensive analytics
    trackEngagement.signupComplete(email);
    trackConversion.emailSignup();

    try {
      // Send checklist via API
      const response = await fetch('/api/send-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, type }),
      });

      if (response.ok) {
        const data = await response.json();
        setChecklistUrl(data.downloadUrl);
        setEmailSent(data.emailSent || false);
        setShowSuccess(true);
        
        // Track successful signup
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'checklist_delivered', {
            event_category: 'lead_generation',
            event_label: type,
            email_sent: data.emailSent
          });
        }

        // Proceed with the original flow
        onSubmit(email);
      } else {
        console.error('Failed to send checklist');
        // Still proceed with original flow even if email fails
        onSubmit(email);
      }
    } catch (error) {
      console.error('Error sending checklist:', error);
      // Still proceed with original flow even if email fails
      onSubmit(email);
    }
    
    setIsSubmitting(false);
    if (!showSuccess) {
      setEmail('');
    }
  };

  const benefits = type === 'free_analysis' 
    ? [
        "Complete plain English breakdown",
        "Line-by-line cost explanations", 
        "Save quotes to your dashboard",
        "Free contractor red flags guide",
        "Instant results in 60 seconds"
      ]
    : [
        "23 contractor red flags to avoid",
        "Real cases costing homeowners $50K+",
        "Negotiation tactics that work",
        "Exclusive contractor checklist"
      ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-lg">
      <div className="text-center">
        {showSuccess ? (
          /* Success State */
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4"
            >
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
            >
              🎉 Success! Check Your Email
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 dark:text-gray-300 mb-6"
            >
              {emailSent ? (
                <>Your contractor red flags checklist has been sent to <strong>{email}</strong></>
              ) : (
                <>Your contractor red flags checklist is ready! We&apos;ll also email it to <strong>{email}</strong> shortly.</>
              )}
            </motion.p>

            {checklistUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6"
              >
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Can&apos;t wait? Download it now:
                </p>
                <a 
                  href={checklistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📋 Download Checklist
                </a>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                What&apos;s included in your checklist:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• 23 critical red flags to watch for</li>
                <li>• Real cost examples ($15K+ saved)</li>
                <li>• Questions to ask every contractor</li>
                <li>• Licensing &amp; insurance verification tips</li>
                <li>• Payment protection strategies</li>
              </ul>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={onClose}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Continue to Your Analysis →
            </motion.button>
          </>
        ) : (
          /* Original Form State */
          <>
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4"
            >
              {type === 'free_analysis' ? (
                <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <Gift className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              )}
            </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-300 mb-6"
        >
          {subtitle}
        </motion.p>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            {type === 'free_analysis' ? "You'll Get:" : "What's Inside:"}
          </h3>
          <div className="grid grid-cols-1 gap-2 text-left">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center space-x-4 mb-6 text-sm text-gray-600 dark:text-gray-400"
        >
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span>4.9/5 from 2,847 users</span>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!email.includes('@') || isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              buttonText
            )}
          </motion.button>
        </motion.form>

            {/* Trust line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-gray-500 dark:text-gray-400 mt-4"
            >
              🔒 100% secure. No spam. Unsubscribe anytime. Trusted by 10,000+ homeowners.
            </motion.p>
          </>
        )}
      </div>
    </Modal>
  );
}