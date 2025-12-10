'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shield, CheckCircle } from 'lucide-react';

interface StickyHeaderProps {
  onCTAClick: () => void;
  isVisible?: boolean;
}

export default function StickyHeader({ onCTAClick, isVisible = true }: StickyHeaderProps) {
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Show sticky header after user scrolls down
    const handleScroll = () => {
      setShow(window.scrollY > 200);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Countdown timer - 6 hours from now
    const targetTime = new Date().getTime() + (6 * 60 * 60 * 1000);
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetTime - now;
      
      if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call
    
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b-2 border-orange-500 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-600 dark:text-gray-300">Special pricing ends in:</span>
                  <span className="font-bold text-orange-600">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Money-back guarantee</span>
                </div>
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Avg. savings: $2,400+</span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCTAClick}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-colors flex items-center space-x-2"
              >
                <span>Get Quote Analyzed - $4.99</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}