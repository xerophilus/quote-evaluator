"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Star, ChevronDown, ChevronUp, Wrench, Users, Award, MapPin } from 'lucide-react';
import { trackClick } from '@/lib/analytics';

interface AffiliateLink {
  id: string;
  name: string;
  description: string;
  category: 'contractor' | 'tool' | 'material';
  rating: number;
  price?: string;
  discount?: string;
  affiliateUrl: string;
  logoUrl?: string;
  features: string[];
  location?: string;
}

interface AffiliateRecommendationsProps {
  projectType: string;
  analysisType: 'free' | 'pro' | 'subscription' | 'lifetime';
  userLocation?: string;
}

export default function AffiliateRecommendations({ 
  projectType, 
  analysisType, 
  userLocation = 'nationwide' 
}: AffiliateRecommendationsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Sample affiliate data - in production, this would come from an API
  const getRecommendations = (type: string): AffiliateLink[] => {
    const baseRecommendations: Record<string, AffiliateLink[]> = {
      'kitchen': [
        {
          id: 'angi-kitchen',
          name: 'Angi (formerly Angie\'s List)',
          description: 'Find pre-screened kitchen remodel contractors in your area',
          category: 'contractor',
          rating: 4.8,
          affiliateUrl: 'https://www.angi.com/?aff=quoteevaluator',
          features: ['Background checks', 'Customer reviews', 'Price comparison', 'Money-back guarantee'],
          location: userLocation
        },
        {
          id: 'home-depot-kitchen',
          name: 'Home Depot Installation',
          description: 'Professional kitchen installation services with warranty',
          category: 'contractor',
          rating: 4.6,
          affiliateUrl: 'https://www.homedepot.com/services/c/kitchen?aff=quoteevaluator',
          features: ['Licensed contractors', '1-year warranty', 'Free estimates', 'Financing options']
        },
        {
          id: 'cabinet-tools',
          name: 'Cabinet Hardware Kit',
          description: 'Essential tools for DIY cabinet installation',
          category: 'tool',
          rating: 4.7,
          price: '$79.99',
          discount: 'Save 15%',
          affiliateUrl: 'https://amazon.com/cabinet-tools?tag=quoteevaluator-20',
          features: ['Complete tool set', 'Installation guide', 'Money-back guarantee']
        }
      ],
      'bathroom': [
        {
          id: 'thumbtack-bathroom',
          name: 'Thumbtack',
          description: 'Compare quotes from local bathroom contractors',
          category: 'contractor',
          rating: 4.7,
          affiliateUrl: 'https://www.thumbtack.com/bathroom-remodel?aff=quoteevaluator',
          features: ['Instant quotes', 'Verified contractors', 'Customer reviews', 'Project matching']
        },
        {
          id: 'lowes-bathroom',
          name: 'Lowe\'s Installation',
          description: 'Full-service bathroom renovation with project manager',
          category: 'contractor',
          rating: 4.5,
          affiliateUrl: 'https://www.lowes.com/services/bathroom-remodel?aff=quoteevaluator',
          features: ['Project manager', 'Design consultation', 'Installation warranty', 'Financing']
        }
      ],
      'roofing': [
        {
          id: 'roofing-contractors',
          name: 'RoofingContractors.net',
          description: 'Network of certified roofing professionals',
          category: 'contractor',
          rating: 4.9,
          affiliateUrl: 'https://roofingcontractors.net/?ref=quoteevaluator',
          features: ['Licensed & insured', 'Warranty backed', 'Emergency services', 'Multiple quotes']
        }
      ]
    };

    return baseRecommendations[type] || baseRecommendations['kitchen'];
  };

  const recommendations = getRecommendations(projectType.toLowerCase());
  
  const categories = {
    contractor: { icon: Users, title: 'Recommended Contractors', color: 'blue' },
    tool: { icon: Wrench, title: 'Recommended Tools', color: 'green' },
    material: { icon: Award, title: 'Quality Materials', color: 'purple' }
  };

  const handleAffiliateClick = (link: AffiliateLink) => {
    trackClick.affiliate(link.name);
    
    // Track which specific recommendation was clicked
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'affiliate_click', {
        'event_category': 'monetization',
        'event_label': link.id,
        'affiliate_partner': link.name,
        'project_type': projectType,
        'recommendation_category': link.category,
        'value': 1
      });
    }
    
    window.open(link.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) acc[rec.category] = [];
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, AffiliateLink[]>);

  // Only show for pro/subscription users
  if (analysisType === 'free') {
    return null;
  }

  return (
    <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Recommended Next Steps
        </h2>
        <p className="text-gray-600">
          Trusted partners to help you complete your {projectType} project
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedRecommendations).map(([category, items]) => {
          const categoryInfo = categories[category as keyof typeof categories];
          const Icon = categoryInfo.icon;
          const isExpanded = expandedCategory === category;

          return (
            <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full bg-${categoryInfo.color}-100`}>
                    <Icon className={`h-5 w-5 text-${categoryInfo.color}-600`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{categoryInfo.title}</h3>
                    <p className="text-sm text-gray-500">{items.length} recommendations</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span>{item.rating}</span>
                                </div>
                                {item.location && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{item.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {item.price && (
                                <div className="text-lg font-bold text-gray-900">{item.price}</div>
                              )}
                              {item.discount && (
                                <div className="text-sm text-green-600 font-semibold">{item.discount}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.features.slice(0, 3).map((feature, index) => (
                              <span 
                                key={index}
                                className="inline-block bg-white px-2 py-1 rounded text-xs text-gray-600 border"
                              >
                                {feature}
                              </span>
                            ))}
                            {item.features.length > 3 && (
                              <span className="inline-block px-2 py-1 rounded text-xs text-gray-500">
                                +{item.features.length - 3} more
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleAffiliateClick(item)}
                            className={`w-full bg-${categoryInfo.color}-600 hover:bg-${categoryInfo.color}-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors`}
                          >
                            <span>View Details</span>
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Disclosure:</strong> We may earn a commission from purchases made through these links. 
          This helps keep QuoteEvaluator free and doesn't affect the price you pay.
        </p>
      </div>
    </div>
  );
}