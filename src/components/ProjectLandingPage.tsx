'use client';

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
import { trackPayment, trackEngagement, trackClick, trackError, trackFeature, trackEmail, trackProjectLanding } from "@/lib/analytics";
import { ProjectData } from "@/lib/projectData";

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
  analysisType: "free" | "pro" | "subscription";
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

interface ProjectLandingPageProps {
  project: ProjectData;
}

export default function ProjectLandingPage({ project }: ProjectLandingPageProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData>({
    projectType: project.title,
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
  
  // Free usage tracking
  const [freeUsageCount, setFreeUsageCount] = useState(0);
  const [hasUsedFreeQuote, setHasUsedFreeQuote] = useState(false);
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const [pendingAnalysisType, setPendingAnalysisType] = useState<"free" | "pro" | "subscription" | null>(null);

  // Scroll to analysis form for sticky header CTA
  const scrollToAnalysisForm = () => {
    // Track sticky header CTA click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sticky_header_cta_click', {
        'event_category': 'conversion_optimization',
        'event_label': 'project_landing_page',
        'project_type': project.title,
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
    
    // Set subscription state
    setHasSubscription(!!localStorage.getItem('pro_subscription_email'));
    
    // Set first-time visitor state for conversion optimization
    const firstVisit = !localStorage.getItem('returning_user');
    setIsFirstVisit(firstVisit);
    if (firstVisit) {
      localStorage.setItem('returning_user', 'true');
      // Track first-time visitor for project landing page
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'first_time_visitor', {
          'event_category': 'conversion_optimization',
          'event_label': 'project_landing_page',
          'project_type': project.title,
          'page_url': window.location.pathname
        });
      }
    }
    
    // Track project landing page view and get URL params
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || 'direct';
    trackProjectLanding.pageView(project.title, utmSource);
    const proParam = urlParams.get('pro');
    const quoteIdParam = urlParams.get('quote_id');
    const stepParam = urlParams.get('step');
    
    if (proParam === 'true' && quoteIdParam) {
      const proAccess = localStorage.getItem(`pro_access_${quoteIdParam}`);
      const subscriptionEmail = localStorage.getItem('pro_subscription_email');
      
      if (proAccess || subscriptionEmail) {
        if (stepParam === '3') {
          setCurrentStep(3);
        }
      }
    }

    // Check free usage
    const usageCount = parseInt(localStorage.getItem('free_usage_count') || '0');
    const hasUsed = localStorage.getItem('has_used_free_quote') === 'true';
    setFreeUsageCount(usageCount);
    setHasUsedFreeQuote(hasUsed);
  }, [project.title, isFirstVisit]);

  // Get user email for saving quotes
  const getUserEmail = () => {
    if (typeof window === 'undefined') return 'anonymous';
    
    const subscriptionEmail = localStorage.getItem('pro_subscription_email');
    if (subscriptionEmail) return subscriptionEmail;
    
    const freeUserEmail = localStorage.getItem('free_user_email');
    if (freeUserEmail) return freeUserEmail;
    
    return 'anonymous';
  };

  // Check if user can save quotes
  const canSaveQuotes = () => {
    if (typeof window === 'undefined') return false;
    return !!(localStorage.getItem('pro_subscription_email') || localStorage.getItem('free_user_email'));
  };

  // Check if user can use free analysis
  const canUseFreeAnalysis = () => {
    if (typeof window === 'undefined') return true;
    const hasSubscription = localStorage.getItem('pro_subscription_email');
    return !hasUsedFreeQuote && !hasSubscription;
  };

  // File upload handler
  const handleFileUpload = async (file: File) => {
    setIsParsingFile(true);
    setParseError(null);
    
    try {
      // Track project-specific file upload
      trackEngagement.formInteraction('file_upload', project.slug);
      trackProjectLanding.fileUpload(project.title, file.type);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        const parsedFile: ParsedFile = {
          text: result.text,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        };
        
        setQuoteData(prev => ({
          ...prev,
          uploadedFile: file,
          parsedFile: parsedFile,
          quoteText: result.text
        }));
        
        // Track successful file upload
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'file_upload_success', {
            'event_category': 'user_action',
            'event_label': project.slug,
            'file_type': file.type,
            'file_size': file.size
          });
        }
      } else {
        setParseError(result.error || 'Failed to parse file. Please try again.');
        
        // Track file upload failure
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'file_upload_failed', {
            'event_category': 'error',
            'event_label': project.slug,
            'error_message': result.error
          });
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      setParseError('Network error. Please check your connection and try again.');
    } finally {
      setIsParsingFile(false);
    }
  };

  // Handle analyze quote
  const handleAnalyzeQuote = async () => {
    if (!quoteData.quoteText.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectType: quoteData.projectType,
          quoteText: quoteData.quoteText,
          analysisType: quoteData.analysisType,
          projectSpecific: project.slug // Pass project context
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAnalysisResult(result.analysis);
        
        // Track project-specific analysis completion
        trackProjectLanding.analyzeClick(project.title, quoteData.analysisType);
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'quote_analysis_complete', {
            'event_category': 'conversion',
            'event_label': project.slug,
            'analysis_type': quoteData.analysisType,
            'project_type': project.title
          });
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle payment for pro analysis
  const handleProPayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_pro_single',
          projectType: project.title,
          landingPage: project.slug
        }),
      });
      
      const { url } = await response.json();
      
      // Track project-specific payment initiation
      const amount = quoteData.analysisType === "subscription" ? 9.99 : 4.99;
      trackProjectLanding.paymentInitiated(project.title, quoteData.analysisType, amount);
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'payment_initiated', {
          'event_category': 'conversion',
          'event_label': project.slug,
          'project_type': project.title
        });
      }
      
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Email signup handler
  const handleEmailSignup = (email: string) => {
    localStorage.setItem('free_user_email', email);
    setShowEmailSignup(false);
    
    // Track project-specific email signup
    trackEmail.signupSuccess(email, 'project_landing', project.slug);
    trackProjectLanding.emailSignup(project.title, 'project_landing');
    
    if (pendingAnalysisType) {
      setQuoteData(prev => ({ ...prev, analysisType: pendingAnalysisType }));
      setPendingAnalysisType(null);
      handleAnalyzeQuote();
    }
  };

  // Drag and drop handlers
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sticky Header for conversion optimization */}
      <StickyHeader onCTAClick={scrollToAnalysisForm} isVisible={currentStep === 1} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Project-Specific Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Logo */}
          <div className="mb-8">
            <Logo />
          </div>

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
              <span>10,000+ Quotes Analyzed</span>
            </motion.div>
          </motion.div>

          {/* Project-Specific Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            {project.headline.split(' ').slice(0, -1).join(' ')}{' '}
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-red-600 dark:text-red-400"
            >
              {project.headline.split(' ').slice(-1)[0]}
            </motion.span>
          </motion.h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {project.subheadline}. Get instant AI analysis of your {project.title.toLowerCase()} quote. 
            <strong> Average savings: {project.averageSavings} per project.</strong>
          </p>
          
          {/* Project-Specific Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span><strong>4.9/5</strong> from {project.title} owners</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Average savings: <strong>{project.averageSavings}</strong></span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <Shield className="h-4 w-4 text-blue-500" />
              <span><strong>89%</strong> avoid overcharges</span>
            </div>
          </div>

          {/* Project-Specific Urgency */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-orange-800 dark:text-orange-200">
              <span className="text-lg">⏰</span>
              <span className="font-semibold">{project.urgencyText}</span>
            </div>
          </div>
        </motion.div>

        {/* Quote Analysis Form */}
        <div id="quote-analysis-form" className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-16">
          {/* Step 1: Quote Input */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Analyze Your {project.title} Quote
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
                Upload your {project.title.toLowerCase()} quote or paste the text directly
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

                {/* File Parsing Status */}
                {isParsingFile && (
                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing your file...</span>
                  </div>
                )}

                {/* Parse Error */}
                {parseError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <span className="text-red-700">{parseError}</span>
                  </div>
                )}

                {/* Uploaded File Display */}
                {quoteData.uploadedFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <File className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">{quoteData.uploadedFile.name}</span>
                      <span className="text-green-600 text-sm">
                        ({(quoteData.uploadedFile.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => setQuoteData(prev => ({ ...prev, uploadedFile: undefined, parsedFile: undefined, quoteText: "" }))}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* Text Input */}
                <div>
                  <label htmlFor="quoteText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Or paste your {project.title.toLowerCase()} quote text here:
                  </label>
                  <textarea
                    id="quoteText"
                    value={quoteData.quoteText}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, quoteText: e.target.value }))}
                    className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder={`Paste your ${project.title.toLowerCase()} quote details here...`}
                  />
                </div>

                {/* Pricing Options - Now Project-Aware */}
                {quoteData.quoteText.trim() && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                      Choose Your {project.title} Analysis
                    </h3>
                    
                    <div className={`grid grid-cols-1 gap-6 mb-8 ${isHydrated && isFirstVisit ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                      {/* Free Tier - Hidden for first-time visitors */}
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
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Free Analysis</h4>
                            <p className="text-3xl font-bold text-blue-600 mb-4">$0</p>
                            {canUseFreeAnalysis() ? (
                              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                <li>✓ Basic {project.title.toLowerCase()} analysis</li>
                                <li>✓ Cost breakdown</li>
                                <li>✓ Project insights</li>
                                <li className="text-orange-600 dark:text-orange-400 font-medium">⚡ One-time offer</li>
                              </ul>
                            ) : (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                <p>✓ You've used your free analysis</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pro Analysis */}
                      <div className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                        quoteData.analysisType === "pro"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                      onClick={() => setQuoteData(prev => ({ ...prev, analysisType: "pro" }))}>
                        <div className="text-center">
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.title} Pro</h4>
                          <div className="mb-2">
                            <p className="text-3xl font-bold text-blue-600">$4.99</p>
                            <p className="text-sm text-green-600 font-semibold">Avg savings: {project.averageSavings}</p>
                          </div>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                            <li>✓ {project.title}-specific red flags</li>
                            <li>✓ Overcharge detection</li>
                            <li>✓ Negotiation strategies</li>
                            <li>✓ Cost comparison data</li>
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
                          <h4 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">Pro Unlimited</h4>
                          <p className="text-3xl font-bold text-purple-600 mb-4">$9.99<span className="text-base font-normal text-gray-500">/mo</span></p>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                            <li>✓ Unlimited {project.title.toLowerCase()} quotes</li>
                            <li>✓ All project types</li>
                            <li>✓ Priority support</li>
                            <li>✓ Advanced analytics</li>
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

                    {/* Analysis Button */}
                    <div className="flex justify-center">
                      {quoteData.analysisType === "free" ? (
                        <motion.button
                          whileHover={{ scale: canUseFreeAnalysis() ? 1.02 : 1 }}
                          whileTap={{ scale: canUseFreeAnalysis() ? 0.98 : 1 }}
                          onClick={() => {
                            if (canUseFreeAnalysis()) {
                              setPendingAnalysisType("free");
                              setShowEmailSignup(true);
                            }
                          }}
                          disabled={!canUseFreeAnalysis() || isAnalyzing}
                          className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                            canUseFreeAnalysis() && !isAnalyzing
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:scale-105"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin mr-2 inline" />
                              Analyzing...
                            </>
                          ) : (
                            <>Get Free {project.title} Analysis</>
                          )}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={quoteData.analysisType === "subscription" ? handleProPayment : handleProPayment}
                          disabled={isProcessingPayment}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
                        >
                          {isProcessingPayment ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin mr-2 inline" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 mr-2 inline" />
                              Get Pro {project.title} Analysis - ${quoteData.analysisType === "subscription" ? "9.99/mo" : "4.99"}
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Project-Specific Content Sections */}
        
        {/* Common Overcharges */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Common {project.title} Overcharges to Watch For
          </h2>
          
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.commonOvercharges.map((overcharge, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-red-800 dark:text-red-200 text-sm">{overcharge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Fair vs. Overcharged {project.title} Prices
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {project.title} Component
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fair Price Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Overcharge Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Potential Savings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {project.costBreakdown.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.item}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-semibold">
                      {item.fairPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-semibold">
                      {item.overchargePrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-bold">
                      {item.savings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project-Specific Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {project.title} Owners Who Avoided Overcharges
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {project.testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                  <p className="text-lg font-bold text-green-600 mt-2">Saved: {testimonial.amount}</p>
                  <p className="text-xs text-gray-500 mt-1">{testimonial.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Capture Section */}
        <div className="mb-16">
          <div className="max-w-2xl mx-auto">
            <EmailCaptureForm source="inline" />
          </div>
        </div>

        {/* Project-Specific FAQ/Tips */}
        <div className="mb-16 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            {project.title} Red Flags to Spot Immediately
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.redFlags.map((flag, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <X className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium text-sm">{flag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Email Signup Modal */}
      <EmailSignupModal
        isOpen={showEmailSignup}
        onClose={() => {
          setShowEmailSignup(false);
          setPendingAnalysisType(null);
        }}
        onSubmit={handleEmailSignup}
        title={`Get Your Free ${project.title} Analysis`}
        subtitle={`Enter your email to get your analysis + save quotes + free contractor red flags guide`}
        buttonText="Get Free Analysis"
        type="free_analysis"
      />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
}