"use client";

import { useState, useEffect, useCallback } from "react";
import { trackEngagement, trackClick, trackError } from "@/lib/analytics";
import { 
  FileText, 
  Crown, 
  TrendingUp, 
  BarChart3,
  Settings,
  Download,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  Star,
  X
} from "lucide-react";
import { FirestoreService, SavedQuote } from "@/lib/firestore";

interface UserStats {
  totalQuotes: number;
  freeQuotes: number;
  proQuotes: number;
  lastVisit: string;
  joinDate: string;
  favoriteAnalysisType: string;
  averageHealthScore: string;
  totalSavings: number;
}

interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  email: string;
  subscriptionInfo?: {
    id: string;
    status: string;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  };
}

interface DashboardProps {
  userEmail: string;
  subscriptionStatus: SubscriptionInfo;
  onLoadQuote: (quote: SavedQuote) => void;
  onCreateNewQuote: () => void;
}

export default function Dashboard({ 
  userEmail, 
  subscriptionStatus, 
  onLoadQuote, 
  onCreateNewQuote 
}: DashboardProps) {
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'quotes' | 'settings'>('overview');
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    
    // Track dashboard view
    trackEngagement.dashboardView();
    
    try {
      let quotes: SavedQuote[] = [];
      
      // Fast path: anonymous users load from localStorage immediately
      if (!userEmail || userEmail === 'anonymous') {
        try {
          const saved = localStorage.getItem('savedQuotes') || '[]';
          quotes = JSON.parse(saved);
        } catch (error) {
          console.error('Error loading from localStorage:', error);
          quotes = [];
        }
      } else {
        // Authenticated users: load from localStorage first for speed, then sync with Firestore
        try {
          // Load localStorage immediately for instant display
          const saved = localStorage.getItem('savedQuotes') || '[]';
          const localQuotes = JSON.parse(saved);
          
          // Set quotes immediately for fast UI
          quotes = localQuotes;
          setSavedQuotes(localQuotes);
          
          // Calculate and set stats immediately
          const quickStats = calculateUserStats(localQuotes);
          setUserStats(quickStats);
          setLoading(false); // Stop loading immediately
          
          // Then sync with Firestore in background (non-blocking)
          FirestoreService.getQuotesByUser(userEmail)
            .then(async (firestoreQuotes) => {
              // If Firestore has different data, update the UI
              if (JSON.stringify(firestoreQuotes) !== JSON.stringify(localQuotes)) {
                setSavedQuotes(firestoreQuotes);
                const updatedStats = calculateUserStats(firestoreQuotes);
                setUserStats(updatedStats);
              }
              
              // Migrate localStorage to Firestore if needed (background operation)
              await FirestoreService.migrateLocalStorageQuotes(userEmail);
            })
            .catch(error => {
              console.warn('Firestore sync failed, using localStorage data:', error);
            });
          
          return; // Exit early since we already set loading to false
        } catch (error) {
          console.error('Error in optimized loading:', error);
          quotes = [];
        }
      }
      
      setSavedQuotes(quotes);
      const stats = calculateUserStats(quotes);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setSavedQuotes([]);
      setUserStats(null);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    // Only load data when userEmail is actually set
    if (userEmail) {
    loadDashboardData();
    }
  }, [userEmail, loadDashboardData]);

  const calculateUserStats = (quotes: SavedQuote[]): UserStats => {
    const freeQuotes = quotes.filter(q => q.quoteData.analysisType === 'free').length;
    const proQuotes = quotes.filter(q => q.quoteData.analysisType === 'pro' || q.quoteData.analysisType === 'subscription').length;
    
    // Determine favorite analysis type
    const typeCounts = quotes.reduce((acc, quote) => {
      acc[quote.quoteData.analysisType] = (acc[quote.quoteData.analysisType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteAnalysisType = Object.entries(typeCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

    // Calculate average health score
    const quotesWithHealthScore = quotes.filter(q => q.analysisResult?.healthScore?.grade);
    const gradeValues = { 'A+': 100, 'A': 95, 'A-': 90, 'B+': 85, 'B': 80, 'B-': 75, 'C+': 70, 'C': 65, 'C-': 60, 'D': 50, 'F': 25 };
    const avgHealthScore = quotesWithHealthScore.length > 0 
      ? Math.round(quotesWithHealthScore.reduce((sum, q) => sum + (gradeValues[q.analysisResult.healthScore!.grade as keyof typeof gradeValues] || 0), 0) / quotesWithHealthScore.length)
      : 0;
    
    // Calculate estimated total savings (mock calculation)
    const totalSavings = proQuotes * 2400; // $2400 average savings per pro analysis

    return {
      totalQuotes: quotes.length,
      freeQuotes,
      proQuotes,
      lastVisit: new Date().toISOString(),
      joinDate: quotes.length > 0 ? quotes[quotes.length - 1].createdAt : new Date().toISOString(),
      favoriteAnalysisType,
      averageHealthScore: avgHealthScore > 0 ? `${avgHealthScore}%` : 'N/A',
      totalSavings
    };
  };

  const deleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      await FirestoreService.deleteQuote(quoteId);
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('Failed to delete quote');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSubscriptionDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !userEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {userEmail === 'anonymous' ? 'Your Quote Dashboard' : `Welcome back, ${userEmail}`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onCreateNewQuote}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Analysis</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
                         {[
               { id: 'overview', label: 'Overview', icon: BarChart3 },
               { id: 'quotes', label: 'My Quotes', icon: FileText },
               { id: 'settings', label: 'Settings', icon: Settings }
             ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'overview' | 'quotes' | 'settings')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quotes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats?.totalQuotes || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Crown className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pro Analyses</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats?.proQuotes || 0}</p>
                  </div>
                </div>
              </div>

                             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center">
                   <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                     <Star className="h-6 w-6 text-purple-600" />
                   </div>
                   <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Health Score</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats?.averageHealthScore || 'N/A'}</p>
                   </div>
                 </div>
               </div>

               <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                 <div className="flex items-center">
                   <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                     <TrendingUp className="h-6 w-6 text-orange-600" />
                   </div>
                   <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Est. Savings</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">${(userStats?.totalSavings || 0).toLocaleString()}</p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription Status</h3>
              {subscriptionStatus.hasActiveSubscription ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">Pro Subscription Active</p>
                      {subscriptionStatus.subscriptionInfo && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Next billing: {formatSubscriptionDate(subscriptionStatus.subscriptionInfo.currentPeriodEnd)}
                          {subscriptionStatus.subscriptionInfo.cancelAtPeriodEnd && ' (Will cancel)'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Pro</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Free Plan</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Upgrade to unlock Pro features</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </div>

            {/* Recent Quotes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Quotes</h3>
                <button
                  onClick={() => setActiveTab('quotes')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                >
                  View all →
                </button>
              </div>
              {savedQuotes.slice(0, 3).length > 0 ? (
                <div className="space-y-3">
                  {savedQuotes.slice(0, 3).map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{quote.quoteName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(quote.createdAt)} • {quote.quoteData.analysisType}
                        </p>
                      </div>
                      <button
                        onClick={() => onLoadQuote(quote)}
                        className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-3">No quotes analyzed yet</p>
                  <button
                    onClick={onCreateNewQuote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Analyze Your First Quote
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Quotes ({savedQuotes.length})</h2>
              {savedQuotes.length >= 2 && (
                <div className="flex items-center space-x-3">
                  {compareMode && (
                    <>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedQuotes.length} selected
                      </span>
              <button
                        onClick={() => {
                          setCompareMode(false);
                          setSelectedQuotes([]);
                        }}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      if (compareMode) {
                        if (selectedQuotes.length >= 2) {
                          setShowComparison(true);
                        }
                      } else {
                        setCompareMode(true);
                        setSelectedQuotes([]);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      compareMode 
                        ? selectedQuotes.length >= 2
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={compareMode && selectedQuotes.length < 2}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>
                      {compareMode 
                        ? selectedQuotes.length >= 2 
                          ? `Compare ${selectedQuotes.length} Quotes`
                          : 'Select 2+ Quotes'
                        : 'Compare Quotes'
                      }
                    </span>
              </button>
                </div>
              )}
            </div>

            {savedQuotes.length > 0 ? (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedQuotes.map((quote) => (
                    <div 
                      key={quote.id} 
                      className={`bg-white dark:bg-gray-800 rounded-lg p-6 border-2 transition-all duration-200 ${
                        compareMode
                          ? selectedQuotes.includes(quote.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 cursor-pointer'
                          : 'border-gray-200 dark:border-gray-700 hover:shadow-lg'
                      }`}
                      onClick={() => {
                        if (compareMode) {
                          if (selectedQuotes.includes(quote.id)) {
                            setSelectedQuotes(prev => prev.filter(id => id !== quote.id));
                          } else {
                            setSelectedQuotes(prev => [...prev, quote.id]);
                          }
                        }
                      }}
                    >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                        {quote.quoteName}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => onLoadQuote(quote)}
                          className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                          title="View quote"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteQuote(quote.id)}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          title="Delete quote"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="text-gray-900 dark:text-white">{formatDate(quote.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          quote.quoteData.analysisType === 'pro' || quote.quoteData.analysisType === 'subscription'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {quote.quoteData.analysisType.toUpperCase()}
                        </span>
                      </div>
                      {quote.analysisResult?.healthScore && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Grade:</span>
                          <span className={`font-bold ${
                            quote.analysisResult.healthScore.color === 'green' ? 'text-green-600' :
                            quote.analysisResult.healthScore.color === 'orange' ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {quote.analysisResult.healthScore.grade}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {quote.quoteData.quoteText.substring(0, 100)}...
                    </p>
                    
                      {compareMode ? (
                        <div className="flex items-center justify-center">
                          {selectedQuotes.includes(quote.id) ? (
                            <div className="flex items-center space-x-2 text-blue-600 font-medium">
                              <CheckCircle className="h-5 w-5" />
                              <span>Selected</span>
                            </div>
                          ) : (
                            <div className="text-gray-500 dark:text-gray-400">
                              Click to select
                            </div>
                          )}
                        </div>
                      ) : (
                                         <div className="flex space-x-2">
                       <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLoadQuote(quote);
                            }}
                         className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-1"
                       >
                         <Eye className="h-3 w-3" />
                         <span>View</span>
                       </button>
                       <button
                            onClick={(e) => {
                              e.stopPropagation();
                           // Create a data URL with the quote content for download
                           const content = `${quote.quoteName}\n\nQuote Text:\n${quote.quoteData.quoteText}\n\nAnalysis:\n${quote.analysisResult.plainEnglishBreakdown.join('\n\n')}`;
                           const blob = new Blob([content], { type: 'text/plain' });
                           const url = URL.createObjectURL(blob);
                           const a = document.createElement('a');
                           a.href = url;
                           a.download = `${quote.quoteName}.txt`;
                           document.body.appendChild(a);
                           a.click();
                           document.body.removeChild(a);
                           URL.revokeObjectURL(url);
                         }}
                         className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm flex items-center justify-center"
                       >
                         <Download className="h-3 w-3" />
                       </button>
                     </div>
                      )}
                  </div>
                ))}
              </div>

                {/* Enhanced Comparison Section */}
                {(showComparison || (!compareMode && selectedQuotes.length >= 2)) && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Quote Comparison ({selectedQuotes.length} quotes)
                </h3>
                <button
                        onClick={() => {
                          setSelectedQuotes([]);
                          setShowComparison(false);
                          setCompareMode(false);
                        }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                          <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                            <th className="text-left p-4 font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50">Metric</th>
                        {selectedQuotes.slice(0, 4).map(quoteId => {
                          const quote = savedQuotes.find(q => q.id === quoteId);
                          return (
                                <th key={quoteId} className="text-left p-4 font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 min-w-48">
                              {quote?.quoteName || 'Unknown'}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                          {/* Health Score Row */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-25 dark:bg-gray-900/25">
                              Overall Health Score
                            </td>
                        {selectedQuotes.slice(0, 4).map(quoteId => {
                          const quote = savedQuotes.find(q => q.id === quoteId);
                          const score = quote?.analysisResult?.healthScore;
                          return (
                                <td key={quoteId} className="p-4">
                              {score ? (
                                    <div className="flex items-center space-x-2">
                                      <span className={`text-2xl font-bold ${
                                  score.color === 'green' ? 'text-green-600' :
                                  score.color === 'orange' ? 'text-orange-600' :
                                  'text-red-600'
                                }`}>
                                  {score.grade}
                                </span>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        ({score.percentage}%)
                                      </span>
                                    </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                          {/* Red Flags Row */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-25 dark:bg-gray-900/25">
                              Red Flags
                            </td>
                        {selectedQuotes.slice(0, 4).map(quoteId => {
                          const quote = savedQuotes.find(q => q.id === quoteId);
                              const redFlags = quote?.analysisResult?.redFlags || [];
                          return (
                                <td key={quoteId} className="p-4">
                                  <div className="space-y-1">
                                    <span className={`font-bold ${
                                      redFlags.length === 0 ? 'text-green-600' :
                                      redFlags.length <= 2 ? 'text-yellow-600' :
                                      'text-red-600'
                                    }`}>
                                      {redFlags.length} issues
                                    </span>
                                    {redFlags.length > 0 && (
                                      <div className="text-xs space-y-1">
                                        {redFlags.slice(0, 3).map((flag, idx) => (
                                          <div key={idx} className="text-gray-600 dark:text-gray-400 truncate">
                                            • {flag.substring(0, 40)}...
                                          </div>
                                        ))}
                                        {redFlags.length > 3 && (
                                          <div className="text-gray-500 text-xs">+{redFlags.length - 3} more</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>

                          {/* Total Price Row */}
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-25 dark:bg-gray-900/25">
                              Total Price
                            </td>
                            {selectedQuotes.slice(0, 4).map(quoteId => {
                              const quote = savedQuotes.find(q => q.id === quoteId);
                              const price = quote?.analysisResult?.extractedInfo?.totalPrice;
                              return (
                                <td key={quoteId} className="p-4">
                                  {price ? (
                                    <div className="space-y-1">
                                      <div className="text-xl font-bold text-green-600">
                                        ${price.toLocaleString()}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Total project cost
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">Not specified</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>

                          {/* Contractor Info Row */}
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-25 dark:bg-gray-900/25">
                              Contractor
                            </td>
                            {selectedQuotes.slice(0, 4).map(quoteId => {
                              const quote = savedQuotes.find(q => q.id === quoteId);
                              const extractedInfo = quote?.analysisResult?.extractedInfo;
                              return (
                                <td key={quoteId} className="p-4">
                                  <div className="space-y-1">
                                    {extractedInfo?.contractorName ? (
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {extractedInfo.contractorName}
                                      </div>
                                    ) : null}
                                    {extractedInfo?.contractorCompany ? (
                                      <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {extractedInfo.contractorCompany}
                                      </div>
                                    ) : null}
                                    {!extractedInfo?.contractorName && !extractedInfo?.contractorCompany && (
                                      <span className="text-gray-400">Not specified</span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>

                          {/* Analysis Type Row */}
                          <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-25 dark:bg-gray-900/25">
                              Analysis Level
                            </td>
                            {selectedQuotes.slice(0, 4).map(quoteId => {
                              const quote = savedQuotes.find(q => q.id === quoteId);
                              return (
                                <td key={quoteId} className="p-4">
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                quote?.quoteData.analysisType === 'pro' || quote?.quoteData.analysisType === 'subscription'
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                              }`}>
                                {quote?.quoteData.analysisType?.toUpperCase() || 'N/A'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>

                          {/* Quote Length Row */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-25 dark:bg-gray-900/25">
                              Quote Detail Level
                            </td>
                        {selectedQuotes.slice(0, 4).map(quoteId => {
                          const quote = savedQuotes.find(q => q.id === quoteId);
                              const length = quote?.quoteData.quoteText.length || 0;
                              const wordCount = quote?.quoteData.quoteText.split(' ').length || 0;
                          return (
                                <td key={quoteId} className="p-4">
                                  <div className="space-y-1">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {wordCount.toLocaleString()} words
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {length.toLocaleString()} characters
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded ${
                                      length > 3000 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                                      length > 1000 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                    }`}>
                                      {length > 3000 ? 'Very Detailed' : length > 1000 ? 'Moderate' : 'Basic'}
                                    </div>
                                  </div>
                            </td>
                          );
                        })}
                      </tr>

                          {/* Created Date Row */}
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-25 dark:bg-gray-900/25">
                              Created Date
                            </td>
                        {selectedQuotes.slice(0, 4).map(quoteId => {
                          const quote = savedQuotes.find(q => q.id === quoteId);
                              const date = quote ? new Date(quote.createdAt) : null;
                              const daysAgo = date ? Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)) : null;
                          return (
                                <td key={quoteId} className="p-4">
                                  <div className="space-y-1">
                                    <div className="font-medium text-gray-900 dark:text-white">
                              {quote ? formatDate(quote.createdAt) : 'N/A'}
                                    </div>
                                    {daysAgo !== null && (
                                      <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {daysAgo === 0 ? 'Today' : 
                                         daysAgo === 1 ? 'Yesterday' : 
                                         `${daysAgo} days ago`}
                                      </div>
                                    )}
                                  </div>
                            </td>
                          );
                        })}
                      </tr>

                          {/* Key Insights Row */}
                      <tr>
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-25 dark:bg-gray-900/25">
                              Key Insights
                            </td>
                        {selectedQuotes.slice(0, 4).map(quoteId => {
                          const quote = savedQuotes.find(q => q.id === quoteId);
                              const insights = quote?.analysisResult?.plainEnglishBreakdown || [];
                          return (
                                <td key={quoteId} className="p-4">
                                  <div className="space-y-2">
                                    {insights.slice(0, 2).map((insight, idx) => (
                                      <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        • {insight.substring(0, 80)}...
                                      </div>
                                    ))}
                                    {insights.length > 2 && (
                                      <div className="text-xs text-blue-600 dark:text-blue-400">
                                        +{insights.length - 2} more insights
                                      </div>
                                    )}
                                    {insights.length === 0 && (
                                      <span className="text-gray-400 text-sm">No detailed analysis</span>
                                    )}
                                  </div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>

                    {/* Export Options */}
                <div className="mt-6 flex justify-between items-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        💡 Tip: Click on individual quotes above to view full analysis details
                      </div>
                  <button
                    onClick={() => {
                          // Generate detailed comparison report
                      const comparisonData = selectedQuotes.slice(0, 4).map(quoteId => {
                        const quote = savedQuotes.find(q => q.id === quoteId);
                            if (!quote) return null;
                            
                            return {
                          name: quote.quoteName,
                          healthScore: quote.analysisResult?.healthScore?.grade || 'N/A',
                              healthPercentage: quote.analysisResult?.healthScore?.percentage || 'N/A',
                              redFlags: quote.analysisResult?.redFlags || [],
                          analysisType: quote.quoteData.analysisType,
                          created: quote.createdAt,
                              wordCount: quote.quoteData.quoteText.split(' ').length,
                              charCount: quote.quoteData.quoteText.length,
                              insights: quote.analysisResult?.plainEnglishBreakdown || [],
                              totalPrice: quote.analysisResult?.extractedInfo?.totalPrice,
                              contractorName: quote.analysisResult?.extractedInfo?.contractorName,
                              contractorCompany: quote.analysisResult?.extractedInfo?.contractorCompany,
                              projectType: quote.analysisResult?.extractedInfo?.projectType
                            };
                      }).filter(Boolean);
                      
                          const reportContent = `DETAILED QUOTE COMPARISON REPORT
Generated: ${new Date().toLocaleString()}
Quotes Compared: ${comparisonData.length}

${'='.repeat(80)}

${comparisonData.map((quote, index) => `
QUOTE ${index + 1}: ${quote?.name}
${'─'.repeat(40)}
Total Price: ${quote?.totalPrice ? `$${quote.totalPrice.toLocaleString()}` : 'Not specified'}
Contractor: ${quote?.contractorName || 'Not specified'}
Company: ${quote?.contractorCompany || 'Not specified'}
Project Type: ${quote?.projectType || 'Not specified'}
Health Score: ${quote?.healthScore} (${quote?.healthPercentage}%)
Analysis Level: ${quote?.analysisType?.toUpperCase()}
Created: ${new Date(quote?.created || '').toLocaleDateString()}
Word Count: ${quote?.wordCount?.toLocaleString()} words
Character Count: ${quote?.charCount?.toLocaleString()} characters

RED FLAGS (${quote?.redFlags?.length || 0} total):
${quote?.redFlags?.map(flag => `• ${flag}`).join('\n') || 'None identified'}

KEY INSIGHTS:
${quote?.insights?.map((insight, i) => `${i + 1}. ${insight}`).join('\n\n') || 'No detailed analysis available'}
`).join('\n' + '='.repeat(80) + '\n')}

COMPARISON SUMMARY:
${'─'.repeat(40)}
Lowest Price: ${Math.min(...comparisonData.map(q => q?.totalPrice || Infinity)) !== Infinity ? `$${Math.min(...comparisonData.map(q => q?.totalPrice || Infinity)).toLocaleString()}` : 'N/A'}
Highest Price: ${Math.max(...comparisonData.map(q => q?.totalPrice || 0)) || 'N/A' ? `$${Math.max(...comparisonData.map(q => q?.totalPrice || 0)).toLocaleString()}` : 'N/A'}
Best Health Score: ${Math.max(...comparisonData.map(q => parseInt(q?.healthScore?.replace(/[^0-9]/g, '') || '0'))) || 'N/A'}
Fewest Red Flags: ${Math.min(...comparisonData.map(q => q?.redFlags?.length || 999))}
Most Detailed Quote: ${comparisonData.reduce((max, q) => (q?.wordCount || 0) > (max?.wordCount || 0) ? q : max)?.name || 'N/A'}

Generated by QuoteEvaluator.com`;
                      
                      const blob = new Blob([reportContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                          a.download = `detailed-quote-comparison-${new Date().toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                        <span>Export Detailed Report</span>
                  </button>
                </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No quotes yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start analyzing contractor quotes to see them here
                </p>
                <button
                  onClick={onCreateNewQuote}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Analyze Your First Quote
                </button>
              </div>
            )}
          </div>
        )}



        {/* Settings Tab */}
        {activeTab === 'settings' && (

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Member Since
                  </label>
                  <input
                    type="text"
                    value={formatDate(userStats?.joinDate || new Date().toISOString())}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
                             <div className="space-y-4">
                 <button
                   onClick={() => {
                     // Track data export
                     if (typeof window !== 'undefined' && window.gtag) {
                       window.gtag('event', 'data_export', {
                         event_category: 'user_action',
                         event_label: 'subscriber_data_export'
                       });
                     }
                     
                     const allData = {
                       quotes: savedQuotes,
                       stats: userStats,
                       exportDate: new Date().toISOString(),
                       userEmail: userEmail
                     };
                     const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = `quote-evaluator-data-${userEmail}-${new Date().toISOString().split('T')[0]}.json`;
                     document.body.appendChild(a);
                     a.click();
                     document.body.removeChild(a);
                     URL.revokeObjectURL(url);
                   }}
                   className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                 >
                   <Download className="h-4 w-4" />
                   <span>Export My Data</span>
                 </button>
                 <p className="text-sm text-gray-600 dark:text-gray-400">
                   Download all your quotes and usage data in JSON format
                 </p>
               </div>
            </div>

                         {/* Subscription Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Crown className="h-5 w-5 text-yellow-600 mr-2" />
                Subscription Management
              </h3>
              
              {/* Current Plan Status */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {subscriptionStatus.hasActiveSubscription ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900 dark:text-white">Pro Subscription Active</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Subscribed with: {subscriptionStatus.email}
                      </p>
                      {subscriptionStatus.subscriptionInfo && subscriptionStatus.subscriptionInfo.currentPeriodEnd && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Next billing: {new Date(subscriptionStatus.subscriptionInfo.currentPeriodEnd * 1000).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">$29/month</div>
                      <div className="text-sm text-gray-500">Unlimited analyses</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="font-medium text-gray-900 dark:text-white">Free Plan</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Limited to 1 free analysis
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-600">$0/month</div>
                      <div className="text-sm text-gray-500">Basic features</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subscription Actions */}
               <div className="space-y-4">
                {subscriptionStatus.hasActiveSubscription ? (
                  <>
                    {/* Billing Portal Access */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Manage Billing</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Update payment method, view invoices, and manage your subscription
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              // Track billing portal access
                              if (typeof window !== 'undefined' && window.gtag) {
                                window.gtag('event', 'billing_portal_access', {
                                  event_category: 'subscription',
                                  event_label: 'manage_billing'
                                });
                              }

                              // Create billing portal session
                              const response = await fetch('/api/create-billing-portal', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  email: subscriptionStatus.email,
                                  return_url: window.location.href
                                }),
                              });

                              if (response.ok) {
                                const { url } = await response.json();
                                console.log('✅ Portal URL received:', url);
                                window.open(url, '_blank');
                              } else {
                                const errorData = await response.json();
                                console.error('❌ API Error:', errorData);
                                throw new Error(errorData.error || 'Failed to create billing portal session');
                              }
                            } catch (error) {
                              console.error('❌ Error accessing billing portal:', error);
                              console.error('📧 Email being used:', subscriptionStatus.email);
                              console.error('🔐 Has active subscription:', subscriptionStatus.hasActiveSubscription);
                              alert(`Unable to access billing portal.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\nEmail: ${subscriptionStatus.email}\n\nCheck browser console for details.`);
                            }
                          }}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Access Billing Portal
                        </button>
                      </div>

                      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Download Invoices</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Access your billing history and download receipts
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              if (typeof window !== 'undefined' && window.gtag) {
                                window.gtag('event', 'billing_portal_access', {
                                  event_category: 'subscription',
                                  event_label: 'download_invoices'
                                });
                              }

                              const response = await fetch('/api/create-billing-portal', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  email: subscriptionStatus.email,
                                  return_url: window.location.href
                                }),
                              });

                              if (response.ok) {
                                const { url } = await response.json();
                                console.log('✅ Portal URL received:', url);
                                window.open(url, '_blank');
                              } else {
                                const errorData = await response.json();
                                console.error('❌ API Error:', errorData);
                                throw new Error(errorData.error || 'Failed to create billing portal session');
                              }
                            } catch (error) {
                              console.error('❌ Error accessing billing portal:', error);
                              console.error('📧 Email being used:', subscriptionStatus.email);
                              console.error('🔐 Has active subscription:', subscriptionStatus.hasActiveSubscription);
                              alert(`Unable to access billing portal.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\nEmail: ${subscriptionStatus.email}\n\nCheck browser console for details.`);
                            }
                          }}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          View Invoices
                        </button>
                      </div>
                    </div>

                    {/* Cancel Subscription */}
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                      <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Cancel Subscription</h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                        You&apos;ll continue to have access until the end of your current billing period
                 </p>
                 <button
                   onClick={() => {
                          if (confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.')) {
                     if (typeof window !== 'undefined' && window.gtag) {
                              window.gtag('event', 'subscription_cancel_attempt', {
                         event_category: 'subscription',
                                event_label: 'user_initiated'
                              });
                            }
                            // Redirect to billing portal for cancellation
                            fetch('/api/create-billing-portal', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                email: subscriptionStatus.email,
                                return_url: window.location.href
                              }),
                            })
                            .then(response => response.json())
                            .then(data => {
                              if (data.url) {
                                window.open(data.url, '_blank');
                              }
                            })
                            .catch(error => {
                              console.error('Error:', error);
                              alert('Please contact support to cancel your subscription.');
                            });
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel Subscription
                 </button>
               </div>
                  </>
                ) : (
                  <>
                    {/* Upgrade Options for Free Users */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Upgrade to Pro</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        Get unlimited access to all features for $29/month
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined' && window.gtag) {
                              window.gtag('event', 'upgrade_click', {
                                event_category: 'subscription',
                                event_label: 'settings_page'
                              });
                            }
                            window.open('/#pricing', '_blank');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View Pricing
                        </button>
                        <button
                          onClick={() => {
                            const email = prompt('Enter your Pro subscription email address to verify:');
                            if (email && email.includes('@')) {
                              fetch('/api/check-subscription', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email }),
                              })
                              .then(response => response.json())
                              .then(data => {
                                if (data.hasActiveSubscription) {
                                  localStorage.setItem('pro_subscription_email', email);
                                  window.location.reload();
                                } else {
                                  alert('No active subscription found for this email.');
                                }
                              })
                              .catch(error => {
                                console.error('Subscription check error:', error);
                                alert('Error checking subscription. Please try again.');
                              });
                            }
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Verify Existing Subscription
                        </button>
             </div>
          </div>
                  </>
                )}

                {/* Support Contact */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Need Help?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Contact our support team for assistance with your subscription
                  </p>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.gtag) {
                        window.gtag('event', 'support_contact', {
                          event_category: 'support',
                          event_label: 'subscription_help'
                        });
                      }
                      window.open('mailto:support@quoteevaluator.com?subject=Subscription Support&body=Hi, I need help with my subscription.', '_blank');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 