"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Star, CheckCircle } from 'lucide-react';
import { trackClick, trackRevenue } from '@/lib/analytics';

interface RushAnalysisOptionProps {
  isSelected: boolean;
  onToggle: (selected: boolean) => void;
  analysisType: 'free' | 'pro' | 'subscription';
}

export default function RushAnalysisOption({ 
  isSelected, 
  onToggle, 
  analysisType 
}: RushAnalysisOptionProps) {
  const handleToggle = () => {
    const newSelected = !isSelected;
    onToggle(newSelected);
    
    // Track rush analysis selection
    trackClick.cta(
      newSelected ? 'rush_analysis_selected' : 'rush_analysis_deselected', 
      'quote_upload'
    );
    
    if (newSelected) {
      trackRevenue.rushAnalysisSelected(analysisType);
    } else {
      trackRevenue.rushAnalysisDeselected(analysisType);
    }
  };

  // Only show for paid plans
  if (analysisType === 'free') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4"
    >
      <div 
        className={`
          border-2 rounded-xl p-4 cursor-pointer transition-all duration-200
          ${isSelected 
            ? 'border-orange-500 bg-orange-50 shadow-md' 
            : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm'
          }
        `}
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              p-2 rounded-full transition-colors
              ${isSelected ? 'bg-orange-500' : 'bg-orange-100'}
            `}>
              <Zap className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-orange-600'}`} />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">Rush Analysis</h3>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3].map((star) => (
                    <Star 
                      key={star} 
                      className="h-4 w-4 text-yellow-400 fill-current" 
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Priority processing with premium insights
              </p>
              
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-xs text-orange-600">
                  <Clock className="h-3 w-3" />
                  <span>Priority Queue</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Enhanced Analysis</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold text-orange-600">+$9.99</div>
            <div className="text-xs text-gray-500">premium upgrade</div>
          </div>
        </div>
        
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-orange-200"
          >
            <div className="text-sm text-gray-700 space-y-2">
              <p className="font-medium text-orange-800">🔥 Rush Analysis includes:</p>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Priority processing (same speed, premium experience)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Additional contractor negotiation tactics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Market price comparisons for your area</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>VIP customer support</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}