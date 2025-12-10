"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, Twitter, Facebook, Linkedin, Mail, DollarSign, Gift } from 'lucide-react';
import { trackFeature, trackClick } from '@/lib/analytics';

interface ShareAnalysisProps {
  quoteId: string;
  analysisType: 'free' | 'pro' | 'subscription';
  projectType?: string;
  savings?: string;
}

export default function ShareAnalysis({ 
  quoteId, 
  analysisType, 
  projectType = 'home renovation',
  savings = '$2,847'
}: ShareAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralCredits, setReferralCredits] = useState(0);

  // Generate referral link
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://quoteevaluator.com'}?ref=${quoteId}`;
  
  // Share messages
  const shareMessage = `I just saved ${savings} on my ${projectType} using QuoteEvaluator! It analyzes contractor quotes to spot overcharges and red flags. Check it out:`;
  
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(referralLink)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareMessage)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}&title=${encodeURIComponent('I saved money with QuoteEvaluator')}&summary=${encodeURIComponent(shareMessage)}`,
    email: `mailto:?subject=${encodeURIComponent('Check out QuoteEvaluator - I saved ' + savings + '!')}&body=${encodeURIComponent(shareMessage + '\n\n' + referralLink)}`
  };

  const handleShare = (method: string) => {
    trackFeature.shareQuote(method);
    trackClick.social(method);
    
    if (method === 'copy') {
      navigator.clipboard.writeText(`${shareMessage}\n\n${referralLink}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      window.open(shareUrls[method as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  // Load referral credits from localStorage
  React.useEffect(() => {
    const credits = parseInt(localStorage.getItem('referral_credits') || '0');
    setReferralCredits(credits);
  }, []);

  return (
    <div className="border-t pt-6 mt-6">
      {/* Share Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            trackClick.cta('share_analysis_open', 'analysis_results');
          }
        }}
        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-teal-700 transition-colors"
      >
        <Share2 className="h-5 w-5" />
        <span>Share Your Savings & Earn $1 Credit</span>
        <Gift className="h-4 w-4" />
      </button>

      {/* Referral Credits Display */}
      {referralCredits > 0 && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-center space-x-2 text-green-700">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">
              You have ${referralCredits} in referral credits!
            </span>
          </div>
        </div>
      )}

      {/* Share Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-gray-50 rounded-lg p-4 overflow-hidden"
          >
            <div className="space-y-4">
              {/* Referral Info */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Gift className="h-4 w-4 mr-2 text-green-500" />
                  Earn $1 for each friend who analyzes a quote
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  When someone uses your referral link and completes their first analysis, 
                  you both get $1 credit towards future analyses!
                </p>
                
                {/* Copy Link */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => handleShare('copy')}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Share on social media:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center justify-center space-x-2 bg-blue-700 text-white py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('email')}
                    className="flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </button>
                </div>
              </div>

              {/* Preview Message */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Your message:</h4>
                <p className="text-sm text-gray-700 italic">
                  "{shareMessage}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}