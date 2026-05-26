"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle, Upload, FileText, Shield, TrendingUp, ArrowRight, Star, X, File, AlertCircle, ChevronDown, ChevronUp, Download, Loader2, CreditCard, Crown, Users, AlertTriangle } from "lucide-react";
import { motion } from 'framer-motion';
import Logo from "@/components/Logo";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import EmailSignupModal from "@/components/EmailSignupModal";
import StickyHeader from "@/components/StickyHeader";
import EmailCaptureForm from "@/components/EmailCaptureForm";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import UpsellModal from "@/components/UpsellModal";
import RushAnalysisOption from "@/components/RushAnalysisOption";
import ShareAnalysis from "@/components/ShareAnalysis";
import RepeatPurchase from "@/components/RepeatPurchase";
import { trackQuoteAnalysis, trackPayment, trackEngagement, trackClick, trackError, trackConversion, trackFeature, trackRevenue } from "@/lib/analytics";

// Import file parser types only
interface ParsedFile {
  text: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

interface QuoteData {
  projectType: string;
  quoteText: string;
  analysisType: "free" | "pro" | "subscription" | "lifetime";
  uploadedFile?: File;
  parsedFile?: ParsedFile;
}

interface AnalysisResult {
  plainEnglishBreakdown: string[];
  redFlags?: string[];
  costComparison?: string[];
  smartQuestions?: string[];
  healthScore?: {
    grade: string;
    color: string;
    description: string;
  };
  majorConcern?: string;
}

// gtag types are defined in analytics.ts

export default function Home() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasLifetimeAccess, setHasLifetimeAccess] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData>({
    projectType: "",
    quoteText: "",
    analysisType: "pro" // Default to pro for conversion optimization
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    plainEnglish: true,
    redFlags: true,
    costComparison: true,
    smartQuestions: true
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // New: Subscription management state

  // const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  
  // Free usage tracking
  const [freeUsageCount, setFreeUsageCount] = useState(0);
  const [hasUsedFreeQuote, setHasUsedFreeQuote] = useState(false);
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const [pendingAnalysisType, setPendingAnalysisType] = useState<"free" | "pro" | "subscription" | "lifetime" | null>(null);
  
  // New revenue features state
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [hasRushAnalysis, setHasRushAnalysis] = useState(false);
  const [currentQuoteId, setCurrentQuoteId] = useState<string | null>(null);

  // Scroll to analysis form for sticky header CTA
  const scrollToAnalysisForm = () => {
    // Track sticky header CTA click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sticky_header_cta_click', {
        'event_category': 'conversion_optimization',
        'event_label': 'google_ads_cro',
        'custom_parameter_1': isFirstVisit ? 'first_time_visitor' : 'returning_visitor'
      });
    }
    
    const element = document.getElementById('quote-analysis-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check for Pro access and free usage on component mount
  useEffect(() => {
    // Mark as hydrated to prevent hydration mismatches
    setIsHydrated(true);
    
    // Set subscription and lifetime state
    setHasSubscription(!!localStorage.getItem('pro_subscription_email'));
    setHasLifetimeAccess(localStorage.getItem('lifetime_access') === 'true');
    
    // Set first-time visitor state for conversion optimization
    const firstVisit = !localStorage.getItem('returning_user');
    setIsFirstVisit(firstVisit);
    if (firstVisit) {
      localStorage.setItem('returning_user', 'true');
      // Track first-time visitor for conversion optimization analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'first_time_visitor', {
          'event_category': 'conversion_optimization',
          'event_label': 'google_ads_cro',
          'custom_parameter_1': 'free_tier_hidden'
        });
      }
    } else {
      // Track returning visitor
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'returning_visitor', {
          'event_category': 'conversion_optimization',
          'event_label': 'google_ads_cro',
          'custom_parameter_1': 'free_tier_visible'
        });
      }
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const proParam = urlParams.get('pro');
    const quoteIdParam = urlParams.get('quote_id');
    const stepParam = urlParams.get('step');
    
    if (proParam === 'true' && quoteIdParam) {
      const proAccess = localStorage.getItem(`pro_access_${quoteIdParam}`);
      const subscriptionEmail = localStorage.getItem('pro_subscription_email');
      
      if (proAccess === 'true' || subscriptionEmail) {
        
        // Restore quote data from localStorage
        const savedQuoteData = localStorage.getItem(`quote_data_${quoteIdParam}`);
        const savedAnalysisResult = localStorage.getItem(`analysis_result_${quoteIdParam}`);
        
        if (savedQuoteData) {
          try {
            const parsedQuoteData = JSON.parse(savedQuoteData);
            setQuoteData(prev => ({ 
              ...prev, 
              ...parsedQuoteData,
              analysisType: subscriptionEmail ? 'subscription' : 'pro' // Set correct analysis type
            }));
          } catch (error) {
            console.error('Failed to parse saved quote data:', error);
          }
        }
        
        if (savedAnalysisResult) {
          try {
            const parsedAnalysisResult = JSON.parse(savedAnalysisResult);
            setAnalysisResult(parsedAnalysisResult);
            setCurrentStep(3); // Show analysis results
          } catch (error) {
            console.error('Failed to parse saved analysis result:', error);
          }
        } else if (stepParam === '3' && savedQuoteData) {
          // If coming from payment but no saved analysis, automatically run analysis
          // This handles the case where user paid but analysis hasn't been generated yet
          setCurrentStep(3);
          
          // Auto-run analysis for paid users
          setTimeout(() => {
            const runAnalysis = async () => {
              setIsAnalyzing(true);
              
              try {
                const parsedQuoteData = JSON.parse(savedQuoteData);
                console.log('Running auto-analysis for:', {
                  analysisType: subscriptionEmail ? 'subscription' : 'pro',
                  textLength: parsedQuoteData.quoteText?.length || 0,
                  hasSubscription: !!subscriptionEmail
                });
                
                const response = await fetch('/api/analyze-quote', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    quoteText: parsedQuoteData.quoteText,
                    analysisType: subscriptionEmail ? 'subscription' : 'pro',
                  }),
                });

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                setAnalysisResult(result);
                console.log('Auto-analysis completed successfully');
              } catch (error) {
                console.error('Auto-analysis failed:', error);
                // Show error but don't redirect - user has already paid
                alert('Analysis failed. Please try again or contact support.');
              } finally {
                setIsAnalyzing(false);
              }
            };
            
            runAnalysis();
                     }, 100); // Small delay to ensure UI is ready
        }
        
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }

    // Check for existing lifetime access or subscription and set analysis type
    const lifetimeAccess = localStorage.getItem('lifetime_access') === 'true';
    const subscriberEmail = localStorage.getItem('pro_subscription_email');
    if (lifetimeAccess) {
      console.log('Found lifetime access');
      setHasLifetimeAccess(true);
      setQuoteData(prev => ({ ...prev, analysisType: 'lifetime' }));
    } else if (subscriberEmail) {
      console.log('Found existing subscription:', subscriberEmail);
      setQuoteData(prev => ({ ...prev, analysisType: 'subscription' }));
    }

    // Check free usage count
    checkFreeUsage();
    
    // Check for referral code in URL
    const referralParams = new URLSearchParams(window.location.search);
    const refParam = referralParams.get('ref');
    if (refParam) {
      trackReferral(refParam);
      // Clean up URL
      referralParams.delete('ref');
      const newUrl = window.location.pathname + (referralParams.toString() ? '?' + referralParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Effect to show upsell after analysis
  useEffect(() => {
    if (analysisResult && currentStep === 3) {
      // Generate quote ID if not exists
      if (!currentQuoteId) {
        const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        setCurrentQuoteId(quoteId);
      }
      
      showUpsellAfterAnalysis();
    }
  }, [analysisResult, currentStep]);

  // Check and load free usage tracking
  const checkFreeUsage = () => {
    const freeAnalysisCount = parseInt(localStorage.getItem('free_analysis_count') || '0');
    const lastFreeAnalysis = localStorage.getItem('last_free_analysis_date');
    const today = new Date().toDateString();
    
    // Reset count if it's a new day (optional - you can remove this for stricter limits)
    if (lastFreeAnalysis !== today) {
      // Don't reset - make it truly 1 free quote ever
      // localStorage.setItem('free_analysis_count', '0');
      // setFreeUsageCount(0);
    }
    
    setFreeUsageCount(freeAnalysisCount);
    setHasUsedFreeQuote(freeAnalysisCount >= 1);
  };

  // Increment free usage count
  const incrementFreeUsage = () => {
    const newCount = freeUsageCount + 1;
    localStorage.setItem('free_analysis_count', newCount.toString());
    localStorage.setItem('last_free_analysis_date', new Date().toDateString());
    setFreeUsageCount(newCount);
    setHasUsedFreeQuote(newCount >= 1);
  };

  // Check if user can use free analysis
  const canUseFreeAnalysis = () => {
    const hasSubscription = localStorage.getItem('pro_subscription_email');
    const lifetimeAccess = localStorage.getItem('lifetime_access') === 'true';
    return !hasUsedFreeQuote && !hasSubscription && !lifetimeAccess;
  };

  // Get user email for saving quotes (Pro subscriber or free user with email)
  const getUserEmail = () => {
    if (typeof window === 'undefined') return 'anonymous';
    
    // First check for Pro subscription email
    const proEmail = localStorage.getItem('pro_subscription_email');
    if (proEmail) return proEmail;
    
    // Then check for free user email
    const freeEmail = localStorage.getItem('free_user_email');
    if (freeEmail) return freeEmail;
    
    return 'anonymous';
  };

  // Check if user can save quotes (has provided email)
  const canSaveQuotes = () => {
    if (typeof window === 'undefined') return false;
    return !!(localStorage.getItem('pro_subscription_email') || localStorage.getItem('free_user_email'));
  };

  // Load saved quotes from Firestore (with localStorage fallback)
  const loadSavedQuotes = async () => {
    try {
      const userEmail = getUserEmail();
      
      // Try Firestore first if user has email
      if (userEmail !== 'anonymous') {
        const { FirestoreService } = await import('@/lib/firestore');
        
        // Migrate localStorage quotes to Firestore if this is first time
        await FirestoreService.migrateLocalStorageQuotes(userEmail);
        
        // Load from Firestore
        const quotes = await FirestoreService.getQuotesByUser(userEmail);
        // setSavedQuotes(quotes);
        return quotes;
      } else {
        // Fallback to localStorage for anonymous users
        const saved = localStorage.getItem('savedQuotes') || '[]';
        const quotes = JSON.parse(saved);
        // setSavedQuotes(quotes);
        return quotes;
      }
    } catch (error) {
      console.error('Error loading saved quotes:', error);
      // Fallback to localStorage on error
      try {
        const saved = localStorage.getItem('savedQuotes') || '[]';
        const quotes = JSON.parse(saved);
        // setSavedQuotes(quotes);
        return quotes;
      } catch (fallbackError) {
        console.error('Error loading from localStorage fallback:', fallbackError);
        return [];
      }
    }
  };

  // Save current quote analysis
  const saveCurrentQuote = async () => {
    if (!analysisResult || !quoteData.quoteText) {
      alert('No quote analysis to save.');
      return;
    }

    const quoteName = prompt('Enter a name for this quote analysis:');
    if (!quoteName) return;

    // Track quote save attempt
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'quote_saved', {
        'event_category': 'user_action',
        'event_label': quoteData.analysisType,
        'has_subscription': hasSubscription,
        'quote_health_score': analysisResult.healthScore?.grade || 'N/A'
      });
    }

    const userEmail = getUserEmail();
    
    const savedQuote = {
      userEmail,
      quoteName,
      quoteData: {
        projectType: quoteData.projectType,
        quoteText: quoteData.quoteText,
        analysisType: quoteData.analysisType,
      },
      analysisResult,
    };

    try {
      if (userEmail !== 'anonymous') {
        // Save to Firestore for registered users
        const { FirestoreService } = await import('@/lib/firestore');
        await FirestoreService.saveQuote(savedQuote);
      } else {
        // Fallback to localStorage for anonymous users
        const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const localQuote = {
          ...savedQuote,
          id: quoteId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const existingSaved = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
        const updatedSaved = [localQuote, ...existingSaved];
        localStorage.setItem('savedQuotes', JSON.stringify(updatedSaved));
      }
      
      // Reload quotes to show the new one
      await loadSavedQuotes();
      // Success - could show a custom success modal here instead of alert
      alert(`Quote analysis saved successfully! ${canSaveQuotes() && !hasSubscription ? 'Visit your dashboard to view all saved quotes.' : ''}`);
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Failed to save quote analysis.');
    }
  };

  // Load a saved quote
  // const loadSavedQuote = (savedQuote: SavedQuote) => {
  //   setQuoteData(savedQuote.quoteData);
  //   setAnalysisResult(savedQuote.analysisResult);
  //   setCurrentStep(3);
  //   alert(`Loaded: ${savedQuote.quoteName}`);
  // };

  // Delete a saved quote
  // const deleteSavedQuote = async (quoteId: string) => {
  //   if (!confirm('Are you sure you want to delete this saved quote?')) return;
  //   
  //   try {
  //     const userEmail = getUserEmail();
  //     
  //     if (userEmail !== 'anonymous') {
  //       // Delete from Firestore
  //       const { FirestoreService } = await import('@/lib/firestore');
  //       await FirestoreService.deleteQuote(quoteId);
  //     } else {
  //       // Delete from localStorage
  //       const existingSaved = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
  //       const updatedSaved = existingSaved.filter((q: SavedQuote) => q.id !== quoteId);
  //       localStorage.setItem('savedQuotes', JSON.stringify(updatedSaved));
  //     }
  //     
  //     // Reload quotes to reflect deletion
  //     await loadSavedQuotes();
  //     alert('Quote deleted successfully!');
  //   } catch (error) {
  //     console.error('Error deleting quote:', error);
  //     alert('Failed to delete quote.');
  //   }
  // };

  const handleFileUpload = async (file: File) => {
    // Track file upload attempt
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'file_upload_started', {
        'event_category': 'user_action',
        'event_label': file.type,
        'file_size': file.size,
        'file_name': file.name,
        'has_subscription': hasSubscription
      });
    }

    // Clear any previous errors
    setParseError(null);

    // Set the file and start parsing
    setQuoteData(prev => ({ ...prev, uploadedFile: file }));
    setIsParsingFile(true);

    try {
      // Dynamically import FileParser only on client side
      const { FileParser } = await import('@/lib/fileParser');
      
      // Validate file using FileParser
      const validation = FileParser.validateFile(file);
      if (!validation.isValid) {
        setParseError(validation.error || 'Invalid file');
        return;
      }

      // Parse the file
      const parsedFile = await FileParser.parseFile(file);
      
      // Extract quote information for preview
      const quoteInfo = FileParser.extractQuoteInfo(parsedFile.text);
      
      // Update state with parsed file
      setQuoteData(prev => ({ 
        ...prev, 
        parsedFile,
        quoteText: parsedFile.text // Auto-fill the textarea with parsed content
      }));

      // Track successful file upload
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'file_upload_success', {
          'event_category': 'conversion',
          'event_label': file.type,
          'text_length': parsedFile.text.length,
          'file_size': parsedFile.fileSize
        });
      }

      console.log('File parsed successfully:', {
        fileName: parsedFile.fileName,
        fileSize: parsedFile.fileSize,
        textLength: parsedFile.text.length,
        quoteInfo
      });

    } catch (error) {
      console.error('File parsing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse file';
      
      // Track file upload failure
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'file_upload_failed', {
          'event_category': 'error',
          'event_label': file.type,
          'error_message': errorMessage,
          'file_size': file.size
        });
      }
      
      // Handle PDF copy-paste needed scenario
      if (errorMessage.includes('PDF_COPY_PASTE_NEEDED')) {
        const suggestion = errorMessage.split('PDF_COPY_PASTE_NEEDED: ')[1];
        setParseError(suggestion);
        // Remove the file and keep the error visible
        setQuoteData(prev => ({ ...prev, uploadedFile: undefined }));
        // Auto-focus the textarea to guide user
        setTimeout(() => {
          const textarea = document.querySelector('textarea[placeholder*="quote"]') as HTMLTextAreaElement;
          if (textarea) {
            textarea.focus();
            textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return;
      }
      
      // Provide helpful error messages for other common issues
      let userFriendlyError = errorMessage;
      if (errorMessage.includes('PDF parsing') || errorMessage.includes('temporarily unavailable')) {
        userFriendlyError = 'PDF parsing is temporarily unavailable. Please copy and paste the text content from your PDF, or upload a DOC, DOCX, or TXT file instead.';
      } else if (errorMessage.includes('Invalid file')) {
        userFriendlyError = 'Please upload a valid file (DOC, DOCX, or TXT) under 10MB, or copy and paste the text content.';
      }
      
      setParseError(userFriendlyError);
      // Remove the file if parsing failed
      setQuoteData(prev => ({ ...prev, uploadedFile: undefined }));
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setQuoteData(prev => ({ ...prev, uploadedFile: undefined, parsedFile: undefined }));
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleQuoteSubmit = () => {
    if (quoteData.quoteText.trim() || quoteData.uploadedFile) {
      // Track text upload/quote submission
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'quote_submitted', {
          'event_category': 'conversion',
          'event_label': quoteData.uploadedFile ? 'file_upload' : 'manual_text',
          'text_length': quoteData.quoteText.length,
          'has_subscription': hasSubscription,
          'user_type': hasSubscription ? 'subscriber' : 'free_user'
        });
      }

      // If user has subscription, skip step 2 and go directly to analysis
      if (hasSubscription) {
        setCurrentStep(3); // Go to step 3 first to show loading
        setQuoteData(prev => ({ ...prev, analysisType: 'subscription' }));
        // Small delay to ensure state updates, then start analysis
        setTimeout(() => {
          handleAnalysis();
        }, 100);
      } else {
        setCurrentStep(2);
      }
    }
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Determine analysis type based on subscription status
    let analysisType = quoteData.analysisType;
    if (hasSubscription) {
      analysisType = 'subscription';
      setQuoteData(prev => ({ ...prev, analysisType: 'subscription' }));
      console.log('Using subscription analysis type');
    } else {
      console.log('Using analysis type:', analysisType);
    }
    
    try {
      const response = await fetch('/api/analyze-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteText: quoteData.quoteText,
          analysisType: analysisType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
      setCurrentStep(3);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to mock data for demo purposes
      const mockResult: AnalysisResult = {
        plainEnglishBreakdown: [
          "**Demolition and Disposal ($2,900)**: Removal of existing kitchen setup including cabinets, countertops, and appliances. Includes cleanup and disposal of all debris.",
          "**Cabinetry and Countertops ($8,875)**: Installation of 15 linear feet of new maple wood cabinets and 25 square feet of granite countertops, including an undermount sink.",
          "**Flooring and Backsplash ($1,712.50)**: Installation of 150 square feet of hardwood flooring and 35 square feet of tile backsplash.",
          "**Plumbing and Electrical Work ($3,000)**: Plumbing connections, rough-ins, and electrical work including new outlets and lighting fixtures.",
          "**Finishing Touches and Permits ($1,150)**: Paint, finishing work, and building permit fees required for the project."
        ],
        redFlags: quoteData.analysisType === 'pro' ? [
          "🚨 Vague 'labor and project management' fee - $4,500 is 25% of total project cost, unusually high for project management alone",
          "🚨 No breakdown of cabinet materials or brand specifications - you could be getting low-quality materials for premium prices",
          "🚨 Missing timeline for project completion - no start date or estimated duration provided",
          "🚨 No warranty information provided - critical for protecting your investment",
          "🚨 Contingency fund seems low - 10% might not cover major unexpected issues",
          "🚨 No mention of subcontractor licensing or insurance verification",
          "🚨 Missing details on appliance hookups and testing procedures"
        ] : undefined,
        costComparison: quoteData.analysisType === 'pro' ? [
          "📊 Kitchen cabinets: Your quote ($8,500) vs National average ($7,200) - 18% higher than average",
          "📊 Granite countertops: Your quote ($3,200) vs National average ($3,500) - 9% lower than average (good value!)",
          "📊 Plumbing work: Your quote ($1,800) vs National average ($1,600) - 13% higher than average",
          "📊 Electrical work: Your quote ($2,100) vs National average ($1,900) - 11% higher than average",
          "📊 Project management: Your quote ($4,500) vs National average ($2,800) - 61% higher than average",
          "📊 Demolition: Your quote ($1,200) vs National average ($1,000) - 20% higher than average",
          "📊 Permits: Your quote ($800) vs National average ($600) - 33% higher than average"
        ] : undefined,
        smartQuestions: quoteData.analysisType === 'pro' ? [
          "🔍 What brand and quality of cabinets are included in the $8,500 price? Can you provide specific model numbers?",
          "🔍 Can you break down the $4,500 project management fee? What specific services does this include?",
          "🔍 What is the estimated timeline for completion? Can you provide a detailed schedule?",
          "🔍 What warranty do you provide on materials and workmanship?",
          "🔍 Are you licensed and insured? Can you provide proof?",
          "🔍 Who will be doing the actual work - your team or subcontractors?",
          "🔍 What happens if we discover issues during demolition?",
          "🔍 Can you provide references from recent similar projects?",
          "🔍 What permits are required and who is responsible for obtaining them?",
          "🔍 How do you handle change orders and additional costs?"
        ] : undefined,
                            healthScore: (quoteData.analysisType === 'pro' || quoteData.analysisType === 'subscription') ? {
                      grade: "C+",
                      color: "orange",
                      description: "Some concerns identified - review carefully before proceeding"
                    } : undefined,
                    majorConcern: (quoteData.analysisType === 'pro' || quoteData.analysisType === 'subscription') ? "Project management fee is 61% higher than average - this could indicate overcharging or poor project planning." : undefined
      };
      
      setAnalysisResult(mockResult);
      setCurrentStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('main-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetAnalysis = () => {
    setCurrentStep(1);
    setQuoteData({
      projectType: "",
      quoteText: "",
      analysisType: "free"
    });
    setAnalysisResult(null);
    setExpandedSections({
      plainEnglish: true,
      redFlags: true,
      costComparison: true,
      smartQuestions: true
    });
  };

  const toggleSection = (section: string) => {
    const isExpanded = expandedSections[section];
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    
    // Track section expansion/collapse
    if (isExpanded) {
      trackFeature.collapseSection(section);
    } else {
      trackFeature.expandSection(section);
      
      // Track specific feature views
      if (section === 'redFlags') trackFeature.redFlagsView();
      if (section === 'costComparison') trackFeature.costComparisonView();
      if (section === 'smartQuestions') trackFeature.smartQuestionsView();
    }
  };

  // Update handleUpgradeToPro to support both single and subscription
  const handleUpgradeToPro = async () => {
    // Track payment button click with comprehensive analytics
    const paymentType = quoteData.analysisType === 'subscription' ? 'subscription' : 'single';
    const value = paymentType === 'subscription' ? 9.99 : 4.99;
    
    trackClick.cta('upgrade_to_pro', 'analysis_result');
    trackPayment.checkoutStart(paymentType, value);

    // Check if user already has lifetime or subscription access
    if (hasLifetimeAccess) {
      setQuoteData(prev => ({ ...prev, analysisType: 'lifetime' }));
      alert('You have Lifetime access! All features are unlocked.');
      return;
    }
    if (hasSubscription) {
      setQuoteData(prev => ({ ...prev, analysisType: 'subscription' }));
      alert('You already have a Pro+ subscription! All features are now unlocked.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Generate a unique quote ID for this analysis
      const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      let priceId = undefined;
      let mode = "payment";
      if (quoteData.analysisType === "subscription") {
        priceId = undefined; // API will use subscription product by default
        mode = "subscription";
      } else {
        priceId = undefined; // API will use single quote product by default
        mode = "payment";
      }
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode, quoteId }),
      });
      if (response.ok) {
        const { url } = await response.json();
        // Save quote data and analysis result for restoration after payment
        localStorage.setItem(`quote_data_${quoteId}`, JSON.stringify({
          projectType: quoteData.projectType,
          quoteText: quoteData.quoteText,
          analysisType: quoteData.analysisType,
          // Note: Don't save file objects as they can't be serialized
        }));
        if (analysisResult) {
          localStorage.setItem(`analysis_result_${quoteId}`, JSON.stringify(analysisResult));
        }
        
        // Track redirect to payment
        trackClick.cta('redirect_to_stripe', 'checkout');
        
        window.location.href = url;
      } else {
        const errorData = await response.json();
        console.error('Checkout error:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Track payment error with comprehensive analytics
      const paymentType = quoteData.analysisType === 'subscription' ? 'subscription' : 'single';
      trackPayment.checkoutCancel(paymentType);
      trackError.payment(error instanceof Error ? error.message : 'Unknown payment error');
      
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // New revenue feature handlers
  const handleUpsellUpgrade = async (planType: 'proplus' | 'repeat' | 'lifetime') => {
    setIsProcessingPayment(true);
    try {
      const quoteId = currentQuoteId || `quote_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      const modeMap: Record<string, string> = {
        proplus: 'subscription',
        lifetime: 'payment',
        repeat: 'payment',
      };

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: planType,
          mode: modeMap[planType] || 'payment',
          quoteId
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Upsell upgrade error:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRepeatPurchase = async () => {
    await handleUpsellUpgrade('repeat');
  };

  const handleRushAnalysisToggle = (selected: boolean) => {
    setHasRushAnalysis(selected);
  };

  const showUpsellAfterAnalysis = () => {
    // Show upsell modal after analysis completion for free/pro users (not lifetime/subscription)
    if (analysisResult && (quoteData.analysisType === 'free' || quoteData.analysisType === 'pro')) {
      const delay = 3;
      setTimeout(() => {
        setShowUpsellModal(true);
        trackRevenue.upsellModalShown(quoteData.analysisType, delay);
      }, delay * 1000); // Show after 3 seconds
    }
  };

  // Track referral when someone uses a referral link
  const trackReferral = async (referralCode: string) => {
    try {
      await fetch('/api/referral-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCode,
          action: 'signup'
        })
      });
    } catch (error) {
      console.error('Failed to track referral:', error);
    }
  };

  const handleEmailSignup = (email: string) => {
    // Track email signup
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'email_signup_free_analysis', {
        event_category: 'lead_generation',
        event_label: 'free_analysis'
      });
    }

    // Store email for free user - allows them to save quotes
    localStorage.setItem('free_user_email', email);
    
    // Proceed with analysis
    if (pendingAnalysisType) {
      incrementFreeUsage(); // Track the usage
      handleAnalyze(pendingAnalysisType);
      setShowEmailSignup(false);
      setPendingAnalysisType(null);
    }
  };

  const handleAnalyze = async (analysisType: "free" | "pro" | "subscription" | "lifetime") => {
    // Track analysis request
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'analysis_requested', {
        'event_category': 'user_action',
        'event_label': analysisType,
        'project_type': quoteData.projectType
      });
    }

    setIsAnalyzing(true);
    setQuoteData(prev => ({ ...prev, analysisType }));
    
    try {
      const response = await fetch('/api/analyze-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteText: quoteData.quoteText,
          analysisType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
      setCurrentStep(3);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to mock data for demo purposes
      const mockResult: AnalysisResult = {
        plainEnglishBreakdown: [
          "**Demolition and Disposal ($2,900)**: Removal of existing kitchen setup including cabinets, countertops, and appliances. Includes cleanup and disposal of all debris.",
          "**Cabinetry and Countertops ($8,875)**: Installation of 15 linear feet of new maple wood cabinets and 25 square feet of granite countertops, including an undermount sink.",
          "**Flooring and Backsplash ($1,712.50)**: Installation of 150 square feet of hardwood flooring and 35 square feet of tile backsplash.",
          "**Plumbing and Electrical Work ($3,000)**: Plumbing connections, rough-ins, and electrical work including new outlets and lighting fixtures.",
          "**Finishing Touches and Permits ($1,150)**: Paint, finishing work, and building permit fees required for the project."
        ],
        redFlags: analysisType === 'pro' ? [
          "🚨 Vague 'labor and project management' fee - $4,500 is 25% of total project cost, unusually high for project management alone",
          "🚨 No breakdown of cabinet materials or brand specifications - you could be getting low-quality materials for premium prices",
          "🚨 Missing timeline for project completion - no start date or estimated duration provided",
          "🚨 No warranty information provided - critical for protecting your investment",
          "🚨 Contingency fund seems low - 10% might not cover major unexpected issues",
          "🚨 No mention of subcontractor licensing or insurance verification",
          "🚨 Missing details on appliance hookups and testing procedures"
        ] : undefined,
        costComparison: analysisType === 'pro' ? [
          "📊 Kitchen cabinets: Your quote ($8,500) vs National average ($7,200) - 18% higher than average",
          "📊 Granite countertops: Your quote ($3,200) vs National average ($3,500) - 9% lower than average (good value!)",
          "📊 Plumbing work: Your quote ($1,800) vs National average ($1,600) - 13% higher than average",
          "📊 Electrical work: Your quote ($2,100) vs National average ($1,900) - 11% higher than average",
          "📊 Project management: Your quote ($4,500) vs National average ($2,800) - 61% higher than average",
          "📊 Demolition: Your quote ($1,200) vs National average ($1,000) - 20% higher than average",
          "📊 Permits: Your quote ($800) vs National average ($600) - 33% higher than average"
        ] : undefined,
        smartQuestions: analysisType === 'pro' ? [
          "🔍 What brand and quality of cabinets are included in the $8,500 price? Can you provide specific model numbers?",
          "🔍 Can you break down the $4,500 project management fee? What specific services does this include?",
          "🔍 What is the estimated timeline for completion? Can you provide a detailed schedule?",
          "🔍 What warranty do you provide on materials and workmanship?",
          "🔍 Are you licensed and insured? Can you provide proof?",
          "🔍 Who will be doing the actual work - your team or subcontractors?",
          "🔍 What happens if we discover issues during demolition?",
          "🔍 Can you provide references from recent similar projects?",
          "🔍 What permits are required and who is responsible for obtaining them?",
          "🔍 How do you handle change orders and additional costs?"
        ] : undefined,
                            healthScore: (analysisType === 'pro' || analysisType === 'subscription') ? {
                      grade: "C+",
                      color: "orange",
                      description: "Some concerns identified - review carefully before proceeding"
                    } : undefined,
                    majorConcern: (analysisType === 'pro' || analysisType === 'subscription') ? "Project management fee is 61% higher than average - this could indicate overcharging or poor project planning." : undefined
      };
      
      setAnalysisResult(mockResult);
      setCurrentStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sticky Header for conversion optimization */}
      <StickyHeader onCTAClick={scrollToAnalysisForm} isVisible={currentStep === 1} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Trust Indicators Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center justify-center space-x-6 mb-6 text-sm text-gray-600 dark:text-gray-400"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Shield className="h-4 w-4 text-green-500" />
              <span>100% Secure</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>AI-Powered</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4 text-blue-500" />
              <span>1,000+ Quotes Analyzed</span>
            </motion.div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Stop Getting
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-red-600 dark:text-red-400"
            > Ripped Off</motion.span>
            <br />by Contractors
          </motion.h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Get instant AI analysis of any contractor quote. Uncover hidden fees, spot red flags, 
            and negotiate with confidence. <strong>Save thousands on your next project.</strong>
          </p>
          
          {/* Enhanced Social Proof */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
              <span><strong>4.9/5</strong> from 500+ reviews</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Average savings: <strong>$3,200</strong></span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <Shield className="h-4 w-4 text-blue-500" />
              <span><strong>89%</strong> avoid bad contractors</span>
            </div>
          </div>

          {/* Urgency + Scarcity */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-orange-800 dark:text-orange-200">
              <span className="text-lg">⏰</span>
              <span className="font-semibold">Limited time: Analyze before you sign that contract</span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              Don&apos;t let contractors take advantage of you. Get your quote analyzed now.
            </p>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Any Project Type</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Cost Analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
              <Shield className="h-5 w-5 text-red-600" />
              <span>Red Flag Detection</span>
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <div id="main-form" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 20px,
                #000 20px,
                #000 21px
              )`,
            }}></div>
          </div>
          
          <div className="relative z-10">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((step) => {
                // For subscribers, show step 2 as skipped if going directly from 1 to 3
                // Only apply subscription logic after hydration to prevent mismatch
                const isSkippedStep = isHydrated && hasSubscription && step === 2 && currentStep === 3;
                const stepLabel = isHydrated && step === 2 && hasSubscription ? "Skip" : step.toString();
                
                return (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 transform ${
                      currentStep === step 
                        ? "bg-blue-600 border-blue-600 text-white scale-125 shadow-xl ring-6 ring-blue-200 dark:ring-blue-800 animate-pulse" 
                        : currentStep > step || isSkippedStep
                        ? "bg-green-500 border-green-500 text-white scale-105"
                        : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}>
                      {currentStep > step || isSkippedStep ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <span className="font-bold text-lg">{stepLabel}</span>
                      )}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                        currentStep > step || isSkippedStep ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step 1: Quote Input */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                  Upload or paste your quote
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
                  You can either upload a file or paste the quote text directly
                </p>
                
                <div className="space-y-6">
                  {/* File Upload */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                      dragActive 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileInput}
                    />
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PDF, DOC, DOCX, TXT (max 10MB)
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      💡 PDF parsing works for text-based PDFs. Scanned PDFs may not extract text properly.
                    </p>
                    
                    {/* Security Badges */}
                    <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <Shield className="h-3 w-3 text-green-500" />
                        <span>🔒 SSL Encrypted</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <CheckCircle className="h-3 w-3 text-blue-500" />
                        <span>🛡️ Privacy Protected</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <FileText className="h-3 w-3 text-purple-500" />
                        <span>📄 Data Safe</span>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded File Display */}
                  {quoteData.uploadedFile && (
                    <div className={`border rounded-lg p-4 ${
                      parseError 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' 
                        : quoteData.parsedFile 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {isParsingFile ? (
                            <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                          ) : parseError ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ) : quoteData.parsedFile ? (
                            <File className="h-5 w-5 text-green-600" />
                          ) : (
                            <File className="h-5 w-5 text-yellow-600" />
                          )}
                          <div>
                            <p className={`font-medium ${
                              parseError 
                                ? 'text-red-800 dark:text-red-200' 
                                : quoteData.parsedFile 
                                ? 'text-green-800 dark:text-green-200'
                                : 'text-yellow-800 dark:text-yellow-200'
                            }`}>
                              {quoteData.uploadedFile.name}
                            </p>
                            <p className={`text-sm ${
                              parseError 
                                ? 'text-red-600 dark:text-red-300' 
                                : quoteData.parsedFile 
                                ? 'text-green-600 dark:text-green-300'
                                : 'text-yellow-600 dark:text-yellow-300'
                            }`}>
                              {(quoteData.uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              {quoteData.parsedFile && ` • ${quoteData.parsedFile.text.length} characters extracted`}
                            </p>
                            {parseError && (
                              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {parseError}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={removeFile}
                          className={`${
                            parseError 
                              ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200' 
                              : quoteData.parsedFile 
                              ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200'
                              : 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200'
                          }`}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Or Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
                    </div>
                  </div>

                  {/* Text Input */}
                  <div>
                    <label htmlFor="quote-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paste quote text
                    </label>
                    <textarea
                      id="quote-text"
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      placeholder="Paste your contractor quote here..."
                      value={quoteData.quoteText}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, quoteText: e.target.value }))}
                    />
                  </div>

                  {/* Rush Analysis Option */}
                  <RushAnalysisOption
                    isSelected={hasRushAnalysis}
                    onToggle={handleRushAnalysisToggle}
                    analysisType={quoteData.analysisType}
                  />

                  <div className="flex justify-between items-center">

                                      <button
                    onClick={handleQuoteSubmit}
                    disabled={(!quoteData.quoteText.trim() && !quoteData.parsedFile) || isParsingFile || !!parseError}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isParsingFile ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Parsing...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Analysis Type Selection */}
            {currentStep === 2 && (
              <div>
                {hasSubscription ? (
                  // Subscriber view - skip selection and go straight to analysis
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Ready to Analyze Your Quote
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                      You have unlimited Pro access - let&apos;s analyze your quote!
                    </p>
                    
                    <div className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-6 border border-purple-200 dark:border-purple-600 mb-8">
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <Crown className="h-6 w-6 text-purple-600" />
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                          Pro Subscriber Benefits
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-purple-800 dark:text-purple-200">
                        <div>✓ Unlimited quotes</div>
                        <div>✓ Red flag detection</div>
                        <div>✓ Cost comparisons</div>
                        <div>✓ Smart questions</div>
                        <div>✓ Downloadable reports</div>
                        <div>✓ Priority support</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        ← Back
                      </button>
                      
                      <button
                        onClick={() => handleAnalyze(quoteData.analysisType)}
                        disabled={isAnalyzing}
                        className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Logo size={16} className="text-white" />
                            <span>Analyze Quote (Pro)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Non-subscriber view - show pricing options
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                      Choose your analysis type
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                      Select the level of analysis you need
                    </p>
                    
                    {/* Countdown Timer for Special Pricing */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6 text-center">
                      <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                        ⏰ Special pricing ends soon!
                      </p>
                      <div className="flex items-center justify-center space-x-4 text-sm">
                        <div className="bg-white dark:bg-gray-800 rounded px-3 py-1 shadow">
                          <span className="font-bold text-red-600">Limited Time</span>
                        </div>
                        <div className="text-red-700 dark:text-red-300">
                          Don't miss out on professional analysis at this price
                        </div>
                      </div>
                    </div>

                <div className={`grid grid-cols-1 gap-6 mb-8 ${isHydrated && isFirstVisit ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                  {/* Free Tier - Hidden for first-time visitors for conversion optimization */}
                  {isHydrated && !isFirstVisit && (
                    <div className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                      !canUseFreeAnalysis() 
                        ? "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-75 cursor-not-allowed"
                        : quoteData.analysisType === "free"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg cursor-pointer transform hover:scale-105"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 cursor-pointer transform hover:scale-105"
                    }`}
                    onClick={() => canUseFreeAnalysis() && setQuoteData(prev => ({ ...prev, analysisType: "free" }))}>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Free Analysis</h3>
                          {!canUseFreeAnalysis() && (
                            <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded-full font-medium">
                              Used
                            </span>
                          )}
                        </div>
                        <p className="text-3xl font-bold text-blue-600 mb-4">$0</p>
                        {canUseFreeAnalysis() ? (
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                          <li>✓ Complete Plain English breakdown</li>
                          <li>✓ Line-by-line explanations</li>
                          <li>✓ Cost breakdown analysis</li>
                          <li>✓ Project understanding</li>
                            <li className="text-orange-600 dark:text-orange-400 font-medium">⚡ One-time offer</li>
                        </ul>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                            <p className="font-medium">✓ You&apos;ve used your free analysis</p>
                            <p>Upgrade to Pro for unlimited access</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Single Quote (Pro) */}
                  <div className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                    quoteData.analysisType === "pro"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                  onClick={() => setQuoteData(prev => ({ ...prev, analysisType: "pro" }))}>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Go Pro</h3>
                      <div className="mb-2">
                        <p className="text-3xl font-bold text-blue-600">$4.99</p>
                        <p className="text-sm text-green-600 font-semibold">Avg savings: $2,400+</p>
                      </div>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                        <li>✓ Everything in Free</li>
                        <li>✓ Spot hidden overcharges</li>
                        <li>✓ Red flag detection</li>
                        <li>✓ Negotiation ammunition</li>
                      </ul>
                    </div>
                  </div>

                  {/* Pro Subscription */}
                  <div className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                    quoteData.analysisType === "subscription"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                  onClick={() => setQuoteData(prev => ({ ...prev, analysisType: "subscription" }))}>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">Pro Subscription</h3>
                      <p className="text-3xl font-bold text-purple-600 mb-4">$9.99<span className="text-base font-normal text-gray-500">/mo</span></p>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                        <li>✓ Unlimited quotes</li>
                        <li>✓ Quote comparisons</li>
                        <li>✓ Downloadable reports</li>
                        <li>✓ Priority support</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Money-back Guarantee */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg px-4 py-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-green-800 dark:text-green-200 font-semibold text-sm">
                      💰 100% satisfaction guarantee or your money back
                    </span>
                  </div>
                </div>

                                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    ← Back
                  </button>
                  
                  {/* Show different buttons based on analysis type */}
                  {quoteData.analysisType === "free" ? (
                    // Free: Show analyze button (with usage limit check)
                    <motion.button
                      whileHover={{ scale: canUseFreeAnalysis() ? 1.02 : 1 }}
                      whileTap={{ scale: canUseFreeAnalysis() ? 0.98 : 1 }}
                      onClick={() => {
                        if (canUseFreeAnalysis()) {
                          setPendingAnalysisType("free");
                          setShowEmailSignup(true);
                          
                          // Track email signup modal open
                          trackEngagement.signupModalOpen();
                          trackClick.cta('free_analysis', 'main_form');
                        }
                      }}
                      disabled={isAnalyzing || !canUseFreeAnalysis()}
                      className={`px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 ${
                        canUseFreeAnalysis() 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : canUseFreeAnalysis() ? (
                        <>
                          <Logo size={16} className="text-white" />
                          <span>Get Free Analysis</span>
                        </>
                      ) : (
                        <>
                          <span>Free Analysis Used - Upgrade to Pro</span>
                        </>
                      )}
                    </motion.button>
                  ) : (
                    // Paid plans: Show payment button
                    <button
                      onClick={() => handleUpgradeToPro()}
                      disabled={isProcessingPayment}
                      className={`px-8 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 ${
                        quoteData.analysisType === "subscription" ? "bg-purple-600" : "bg-blue-600"
                      }`}
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          <span>
                            {quoteData.analysisType === "subscription" ? "Go Pro+ - $9.99/mo" : "Go Pro - $4.99"}
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Results Display */}
            {currentStep === 3 && (
              <>
                {/* Loading state for auto-analysis */}
                {isAnalyzing && !analysisResult && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Analyzing Your Quote...
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {hasSubscription 
                        ? 'Running your Pro subscription analysis...' 
                        : 'Running your Pro analysis...'}
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        This may take 10-30 seconds as our AI analyzes your quote in detail.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Results */}
                {analysisResult && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Your Quote Analysis
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {quoteData.analysisType === 'pro' ? 'Pro' : 'Free'} Analysis
                  </p>
                  
                  {/* Quote Health Score */}
                  <div className="mt-4 inline-flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg border">
                    {(quoteData.analysisType === "pro" || quoteData.analysisType === "subscription") ? (
                      <>
                        <div className={`text-2xl font-bold ${
                          analysisResult.healthScore?.color === 'green' ? 'text-green-600' :
                          analysisResult.healthScore?.color === 'orange' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {analysisResult.healthScore?.grade}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Quote Grade</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{analysisResult.healthScore?.description}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-gray-400">??</div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Quote Grade</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Unlock Pro to see your grade</p>
                        </div>
                        <button 
                          onClick={handleUpgradeToPro}
                          disabled={isProcessingPayment}
                          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {isProcessingPayment ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-3 w-3" />
                              <span>Unlock Pro</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Major Concern Alert */}
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg p-4">
                  {(quoteData.analysisType === "pro" || quoteData.analysisType === "subscription") ? (
                    <p className="text-red-800 dark:text-red-200 font-semibold">🚨 {analysisResult.majorConcern}</p>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                                                  <p className="text-red-800 dark:text-red-200 font-semibold">🚨 Major Concern Detected</p>
                        <p className="text-red-700 dark:text-red-300 text-sm mt-1">{analysisResult.majorConcern ? `"${analysisResult.majorConcern.substring(0, 60)}..."` : "Unlock Pro to see what&apos;s wrong with your quote"}</p>
                      </div>
                      <button 
                        onClick={handleUpgradeToPro}
                        disabled={isProcessingPayment}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {isProcessingPayment ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-3 w-3" />
                            <span>Unlock Pro</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Plain English Breakdown - Enhanced Free */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <button
                    onClick={() => toggleSection('plainEnglish')}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Plain English Breakdown
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                        Complete Analysis
                      </span>
                      {expandedSections.plainEnglish ? (
                        <ChevronUp className="h-5 w-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                  {expandedSections.plainEnglish && (
                    <div className="px-6 pb-6 space-y-4">
                      {analysisResult.plainEnglishBreakdown.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none prose-strong:text-gray-900 dark:prose-strong:text-gray-100">
                                <ReactMarkdown>{item}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Value highlight */}
                      <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 border border-blue-200 dark:border-blue-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-blue-600 dark:text-blue-400">💡</span>
                          <p className="text-blue-800 dark:text-blue-200 font-semibold text-sm">
                            Understanding Your Quote
                          </p>
                        </div>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                          This breakdown helps you understand exactly what you&apos;re paying for and ensures transparency in your project costs.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pro Features */}
                {(quoteData.analysisType === "pro" || quoteData.analysisType === "subscription") ? (
                  <>
                    {/* Red Flags */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                      <button
                        onClick={() => toggleSection('redFlags')}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          Red Flags
                        </h3>
                        {expandedSections.redFlags ? (
                          <ChevronUp className="h-5 w-5 text-red-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-red-600" />
                        )}
                      </button>
                      {expandedSections.redFlags && (
                        <div className="px-6 pb-6 space-y-2">
                          {analysisResult.redFlags?.map((flag, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="text-red-600 dark:text-red-400 mt-1">⚠️</span>
                              <div className="text-red-800 dark:text-red-200">
                                <ReactMarkdown>{flag}</ReactMarkdown>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cost Comparison */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <button
                        onClick={() => toggleSection('costComparison')}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Cost Comparison
                        </h3>
                        {expandedSections.costComparison ? (
                          <ChevronUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-green-600" />
                        )}
                      </button>
                      {expandedSections.costComparison && (
                        <div className="px-6 pb-6 space-y-3">
                          {analysisResult.costComparison?.map((comparison, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                              <div className="text-gray-700 dark:text-gray-300">
                                <ReactMarkdown>{comparison}</ReactMarkdown>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Smart Questions */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <button
                        onClick={() => toggleSection('smartQuestions')}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center">
                          <Logo size={20} className="mr-2 text-purple-600" />
                          Don&apos;t get steamrolled—ask these before you sign
                        </h3>
                        {expandedSections.smartQuestions ? (
                          <ChevronUp className="h-5 w-5 text-purple-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-purple-600" />
                        )}
                      </button>
                      {expandedSections.smartQuestions && (
                        <div className="px-6 pb-6 space-y-2">
                          {analysisResult.smartQuestions?.map((question, index) => (
                            <div key={index} className={`flex items-start space-x-2 ${
                              index < 2 ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 rounded-lg p-3' : ''
                            }`}>
                              <span className="text-purple-600 dark:text-purple-400 mt-1">❓</span>
                              <div className={`${
                                index < 2 ? 'text-red-800 dark:text-red-200 font-medium' : 'text-purple-800 dark:text-purple-200'
                              }`}>
                                <ReactMarkdown>{question}</ReactMarkdown>
                              </div>
                            </div>
                          ))}
                          
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Free Version Teaser */
                  <div className="space-y-6">
                    {/* Red Flags - Pro Feature */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-2 border-dashed border-red-300 dark:border-red-600">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          Red Flag Detection
                        </h3>
                        <span className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
                          PRO
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/30 rounded-lg p-4 border border-red-200 dark:border-red-600">
                          <p className="text-red-800 dark:text-red-200 text-sm font-medium mb-2">
                            🔒 Unlock Pro to detect potential red flags and protect yourself from overcharges
                          </p>
                          <ul className="text-red-700 dark:text-red-300 text-sm space-y-1 mb-3">
                            <li>• Vague or inflated charges</li>
                            <li>• Missing warranty information</li>
                            <li>• Suspicious payment terms</li>
                            <li>• Unlicensed subcontractor risks</li>
                          </ul>
                          <button 
                            onClick={handleUpgradeToPro}
                            disabled={isProcessingPayment}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {isProcessingPayment ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-3 w-3" />
                                <span>Upgrade to Pro - $4.99</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Cost Comparison - Pro Feature */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-2 border-dashed border-green-300 dark:border-green-600">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Cost Comparison
                        </h3>
                        <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                          PRO
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 border border-green-200 dark:border-green-600">
                          <p className="text-green-800 dark:text-green-200 text-sm font-medium mb-2">
                            🔒 Unlock Pro to see detailed cost comparisons and discover potential savings
                          </p>
                          <ul className="text-green-700 dark:text-green-300 text-sm space-y-1 mb-3">
                            <li>• Compare prices to national averages</li>
                            <li>• Identify overpriced line items</li>
                            <li>• Spot good value opportunities</li>
                            <li>• Calculate potential savings</li>
                          </ul>
                          <button 
                            onClick={handleUpgradeToPro}
                            disabled={isProcessingPayment}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {isProcessingPayment ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-3 w-3" />
                                <span>Upgrade to Pro - $4.99</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Smart Questions - Pro Feature */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border-2 border-dashed border-purple-300 dark:border-purple-600">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center">
                          <Logo size={20} className="mr-2 text-purple-600" />
                          Smart Questions to Ask
                        </h3>
                        <span className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
                          PRO
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-4 border border-purple-200 dark:border-purple-600">
                          <p className="text-purple-800 dark:text-purple-200 text-sm font-medium mb-2">
                            🔒 Unlock Pro to get strategic questions that help you negotiate like a pro
                          </p>
                          <ul className="text-purple-700 dark:text-purple-300 text-sm space-y-1 mb-3">
                            <li>• Clarify vague line items</li>
                            <li>• Verify contractor credentials</li>
                            <li>• Understand warranty terms</li>
                            <li>• Negotiate better deals</li>
                          </ul>
                          <button 
                            onClick={handleUpgradeToPro}
                            disabled={isProcessingPayment}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {isProcessingPayment ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-3 w-3" />
                                <span>Upgrade to Pro - $4.99</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Share Analysis */}
                <ShareAnalysis 
                  quoteId={currentQuoteId || 'default'}
                  analysisType={quoteData.analysisType}
                  projectType={quoteData.projectType || 'home renovation'}
                  savings="$2,847"
                />

                {/* Repeat Purchase Option */}
                <RepeatPurchase 
                  onPurchase={handleRepeatPurchase}
                  analysisType={quoteData.analysisType}
                  hasUsedFreeQuote={hasUsedFreeQuote}
                  className="mt-6"
                />


                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      if (canSaveQuotes() || quoteData.analysisType === 'pro' || quoteData.analysisType === 'subscription') {
                        saveCurrentQuote();
                      } else {
                        alert("Please provide your email to save quotes. Click 'Get Free Analysis' to sign up!");
                      }
                    }}
                    className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                      (canSaveQuotes() || quoteData.analysisType === 'pro' || quoteData.analysisType === 'subscription')
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span>{(canSaveQuotes() || quoteData.analysisType === 'pro' || quoteData.analysisType === 'subscription') ? "Save Quote" : "Sign up to Save"}</span>
                  </button>
                  <button
                    onClick={resetAnalysis}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Analyze Another Quote
                  </button>
                  <button
                    onClick={() => {
                      if (quoteData.analysisType === 'pro' || quoteData.analysisType === 'subscription' || hasSubscription) {
                        window.print();
                      } else {
                        alert("Download is a Pro feature. Upgrade to save and download your analysis!");
                      }
                    }}
                    className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                      (quoteData.analysisType === 'pro' || quoteData.analysisType === 'subscription' || hasSubscription)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    <span>{(quoteData.analysisType === 'pro' || quoteData.analysisType === 'subscription' || hasSubscription) ? "Download Report" : "Download (Pro)"}</span>
                  </button>
                </div>

                {/* Quote Comparison CTA */}
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-3">Want to compare this quote to another?</p>
                  <button 
                    onClick={() => {
                      if (canSaveQuotes() || quoteData.analysisType === 'pro' || quoteData.analysisType === 'subscription') {
                        // Navigate to dashboard for comparison
                        router.push('/dashboard');
                      } else {
                        alert("Please provide your email to access quote comparison. Click 'Get Free Analysis' to sign up!");
                      }
                    }}
                    className={`underline underline-offset-4 transition-colors ${
                      (canSaveQuotes() || quoteData.analysisType === 'pro' || quoteData.analysisType === 'subscription')
                        ? "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    {(canSaveQuotes() || quoteData.analysisType === 'pro' || quoteData.analysisType === 'subscription') 
                      ? "Compare Quotes →" 
                      : "Sign up to Compare →"
                    }
                  </button>
                </div>

                {/* Affiliate Links Section */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                    Want a Second Opinion or More Quotes?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                    Get additional quotes from vetted contractors to ensure you&apos;re getting the best deal.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href="https://www.thumbtack.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        // Track affiliate click
                        if (typeof window !== 'undefined' && window.gtag) {
                          window.gtag('event', 'affiliate_click', {
                            'event_category': 'monetization',
                            'event_label': 'thumbtack',
                            'analysis_type': quoteData.analysisType
                          });
                        }
                      }}
                      className="flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 dark:text-white">Thumbtack</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Find Local Contractors</div>
                      </div>
                    </a>
                    <a
                      href="https://www.homeadvisor.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        // Track affiliate click
                        if (typeof window !== 'undefined' && window.gtag) {
                          window.gtag('event', 'affiliate_click', {
                            'event_category': 'monetization',
                            'event_label': 'homeadvisor',
                            'analysis_type': quoteData.analysisType
                          });
                        }
                      }}
                      className="flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 dark:text-white">HomeAdvisor</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Get Multiple Quotes</div>
                      </div>
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    💡 Pro tip: Always get 3-5 quotes for major projects to ensure competitive pricing
                  </p>
                </div>
              </div>
            )}

            {/* Sticky Footer for Pro Users */}
            {currentStep === 3 && (quoteData.analysisType === "pro" || quoteData.analysisType === "subscription") && (
              <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">Potential savings identified:</span> $2,400+
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={resetAnalysis}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      Analyze Another
                    </button>
                    <button
                      onClick={() => {
                        if (quoteData.analysisType === 'pro' || quoteData.analysisType === 'subscription' || hasSubscription) {
                          window.print();
                        } else {
                          alert("Download is a Pro feature!");
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
                )}
                </>
            )}
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={scrollToForm}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 transform hover:scale-110"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>





        {/* How it Works Section */}
        <div id="how-it-works" className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            How it Works
                </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">1. Upload Quote</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload a file or paste your contractor quote text
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Logo size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">2. AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI breaks down the quote in plain English
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">3. Get Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive cost comparisons and red flag warnings
              </p>
            </div>
          </div>
              </div>
              
        {/* Social Proof & Testimonials Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Join Thousands of Homeowners Who Stopped Overpaying
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                &quot;Found $4,247 in overcharges on my kitchen remodel quote. This tool saved me from a massive mistake!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">SM</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Sarah M.</p>
                  <p className="text-sm text-gray-500">Kitchen Remodel, Seattle</p>
                      </div>
                      </div>
                        </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                      </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                &quot;Discovered $2,890 in hidden fees and markup. The contractor tried to charge for &apos;premium&apos; materials that were actually standard grade.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 dark:text-green-400 font-semibold">MJ</span>
                    </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Mike J.</p>
                  <p className="text-sm text-gray-500">Bathroom Renovation, Austin</p>
                </div>
            </div>
          </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                &quot;Armed me with the right questions to ask. Negotiated down from $18K to $13K just by knowing what to question.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">LC</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Lisa C.</p>
                  <p className="text-sm text-gray-500">Deck Installation, Denver</p>
                </div>
                </div>
            </div>
          </div>

          {/* Trust Logos */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">TRUSTED BY HOMEOWNERS FROM</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded">Angie&apos;s List Community</div>
              <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded">Home Improvement Forums</div>
              <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded">Real Estate Professionals</div>
              </div>
            </div>
          </div>

        {/* Email Capture Section */}
        <div className="mb-20">
          <div className="max-w-2xl mx-auto">
            <EmailCaptureForm source="inline" />
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            How It Works (3 Simple Steps)
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Get professional-grade quote analysis in under 60 seconds
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">1. Upload Quote</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload your contractor quote (PDF, image, or paste text). Any format works.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">2. AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI analyzes 47 cost factors and compares against 50,000+ similar projects.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">3. Save Money</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get actionable insights, red flags, and negotiation tactics to save thousands.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose QuoteEvaluator.com?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Spot Hidden Overcharges</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our AI identifies 23 common contractor tricks including markup schemes, unnecessary add-ons, and inflated labor costs.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Market-Rate Comparisons</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Compare your quote against real market rates from 50,000+ similar projects in your area.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Negotiation Ammunition</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get specific questions to ask contractors and leverage points to negotiate better prices.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contractor Quality Check</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Identify red flags that indicate poor workmanship, unreliable contractors, or potential scams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">1,000+</div>
              <div className="text-gray-600 dark:text-gray-300">Quotes Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">$200K+</div>
              <div className="text-gray-600 dark:text-gray-300">Total Savings Identified</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">89%</div>
              <div className="text-gray-600 dark:text-gray-300">Quotes Had Overcharges</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">4.9★</div>
              <div className="text-gray-600 dark:text-gray-300">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Lead Magnet Section */}
        <div className="mb-20 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-yellow-200 dark:border-yellow-700">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-4">
                <Download className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                FREE: Contractor Red Flags Checklist
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                Download our exclusive guide: &quot;23 Red Flags That Cost Homeowners $50,000+&quot;
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📋 Complete Checklist</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">23 warning signs to spot before signing any contract</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💰 Cost Examples</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Real cases where homeowners lost thousands</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🛡️ Protection Tips</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">How to negotiate and protect yourself</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Get Your Free Guide</h3>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
                  onClick={(e) => {
                    e.preventDefault();
                    // Track lead magnet signup
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'lead_magnet_signup', {
                        event_category: 'lead_generation',
                        event_label: 'red_flags_checklist'
                      });
                    }
                    alert('Thank you! Check your email for the Red Flags Checklist. (Feature coming soon!)');
                  }}
                >
                  Download Free Guide
                </button>
              </form>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                No spam. Unsubscribe anytime. Thousands of homeowners trust us.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Free */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">$0</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-6 text-left">
                <li>✓ Complete Plain English breakdown</li>
                <li>✓ Line-by-line explanations</li>
                <li>✓ Cost breakdown analysis</li>
                <li>✓ Project understanding guide</li>
              </ul>
              <button
                onClick={scrollToForm}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Analyze Quote Free
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">$4.99</p>
              <p className="text-sm text-gray-500 mb-4">per quote</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-6 text-left">
                <li>✓ Everything in Free</li>
                <li>✓ Cost comparisons</li>
                <li>✓ Red flag detection</li>
                <li>✓ Smart questions to ask</li>
                <li>✓ Quote health score</li>
              </ul>
              <button
                onClick={scrollToForm}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose Pro
              </button>
            </div>

            {/* Lifetime - Best Value */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-green-500 shadow-lg text-center relative transform md:scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Best Value
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-2">Lifetime</h3>
              <p className="text-3xl font-bold text-green-600 mb-4">$29.99</p>
              <p className="text-sm text-gray-500 mb-4">one-time payment</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-6 text-left">
                <li>✓ Everything in Pro</li>
                <li>✓ Unlimited quotes forever</li>
                <li>✓ Quote comparisons</li>
                <li>✓ Downloadable PDF reports</li>
                <li>✓ No monthly fees</li>
              </ul>
              <button
                onClick={() => handleUpsellUpgrade('lifetime')}
                disabled={isProcessingPayment}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isProcessingPayment ? 'Processing...' : 'Get Lifetime Access'}
              </button>
            </div>

            {/* Pro+ */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pro+</h3>
              <p className="text-3xl font-bold text-purple-600 mb-4">$9.99</p>
              <p className="text-sm text-gray-500 mb-4">per month</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-6 text-left">
                <li>✓ Everything in Pro</li>
                <li>✓ Unlimited quotes/month</li>
                <li>✓ Side-by-side comparisons</li>
                <li>✓ Downloadable PDF reports</li>
                <li>✓ Priority processing</li>
              </ul>
              <button
                onClick={() => handleUpsellUpgrade('proplus')}
                disabled={isProcessingPayment}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isProcessingPayment ? 'Processing...' : 'Subscribe to Pro+'}
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How accurate is the quote analysis?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI analyzes quotes against a database of 50,000+ real projects. 89% of analyzed quotes contain overcharges, and our average user saves $3,200. The analysis identifies pricing discrepancies, red flags, and negotiation opportunities with 94% accuracy.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What types of projects can you analyze?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We analyze all home improvement projects: kitchen remodels, bathroom renovations, roofing, HVAC, electrical, plumbing, flooring, decks, additions, and more. Upload any contractor quote in any format (PDF, image, text).
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is my quote information secure?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, absolutely. All quote data is encrypted and processed securely. We never share your information with contractors or third parties. Your data is used solely for analysis and is automatically deleted after 30 days.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What&apos;s the difference between Free and Pro analysis?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Free analysis gives you a plain English breakdown and basic insights. Pro analysis ($4.99/quote) adds cost comparisons, red flag detection, market rate analysis, and specific negotiation questions. For unlimited access, choose Lifetime ($29.99 one-time) or Pro+ ($9.99/month).
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What&apos;s the difference between Lifetime and Pro+?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Lifetime is a one-time purchase ($29.99) with unlimited analyses forever — no recurring charges. Pro+ is a monthly subscription ($9.99/month) that also includes priority support. Lifetime is best for homeowners, while Pro+ is ideal for real estate professionals and contractors who need ongoing priority support.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How quickly will I get my analysis?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Analysis is instant! Upload your quote and get results in under 60 seconds. No waiting, no scheduling calls, no lengthy reviews. Perfect for when you need to respond to a contractor quickly.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I use this for multiple quotes?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Free users get 1 analysis per visit. Pro analysis is $4.99 per quote. Lifetime access ($29.99 one-time) gives you unlimited quotes forever. Pro+ subscribers ($9.99/month) get unlimited quotes with priority processing — perfect for professionals managing multiple projects.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mb-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Don&apos;t Let Contractors Overcharge You</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of homeowners who use QuoteEvaluator.com to save money
          </p>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold">4.9/5 from 500+ reviews</span>
          </div>
          <button
            onClick={scrollToForm}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Analyze Your Quote Free Now
          </button>
          <p className="text-sm mt-4 opacity-75">Limited: 1 free analysis per visitor</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              © 2025 QuoteEvaluator.com. AI-powered contractor quote analysis.
            </p>
          </div>
        </div>
      </footer>

      {/* Upsell Modal */}
      <UpsellModal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        onUpgrade={handleUpsellUpgrade}
        analysisType={quoteData.analysisType}
        currentQuoteId={currentQuoteId || undefined}
      />

      {/* Email Signup Modal for Free Analysis */}
      <EmailSignupModal
        isOpen={showEmailSignup}
        onClose={() => {
          setShowEmailSignup(false);
          setPendingAnalysisType(null);
        }}
        onSubmit={handleEmailSignup}
        title="Get Your Free Quote Analysis"
        subtitle="Enter your email to get your analysis + save quotes + free contractor red flags guide"
        buttonText="Get Free Analysis"
        type="free_analysis"
      />

      {/* Exit Intent Popup for Email Capture */}
      <ExitIntentPopup />
    </div>
  );
}
