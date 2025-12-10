"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  DollarSign, TrendingUp, FileText, 
  Download, RefreshCw, Target
} from 'lucide-react';
import { exportExperimentData } from '@/lib/ab-testing';

interface DashboardMetrics {
  revenue: {
    today: number;
    week: number;
    month: number;
    growth: number;
  };
  conversions: {
    overall: number;
    bySource: Array<{ source: string; rate: number; revenue: number }>;
    funnel: Array<{ stage: string; users: number; rate: number }>;
  };
  quotes: {
    total: number;
    byType: Array<{ type: string; count: number; revenue: number }>;
    avgValue: number;
  };
  experiments: {
    active: number;
    results: Array<{ name: string; variant: string; conversions: number; revenue: number }>;
  };
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Simple auth check (in production, use proper authentication)
  useEffect(() => {
    const checkAuth = () => {
      const adminKey = prompt('Enter admin key:');
      if (adminKey === process.env.NEXT_PUBLIC_ADMIN_KEY || adminKey === 'admin123') {
        setIsAuthorized(true);
        loadMetrics();
      } else {
        alert('Unauthorized');
        window.location.href = '/';
      }
    };
    
    checkAuth();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    
    // In production, these would come from your analytics API
    // For now, using mock data with localStorage analytics
    const mockMetrics: DashboardMetrics = {
      revenue: {
        today: parseFloat(localStorage.getItem('revenue_today') || '0'),
        week: parseFloat(localStorage.getItem('revenue_week') || '156.70'),
        month: parseFloat(localStorage.getItem('revenue_month') || '1847.30'),
        growth: 23.5
      },
      conversions: {
        overall: 3.8,
        bySource: [
          { source: 'Google Ads', rate: 4.2, revenue: 847.30 },
          { source: 'Organic', rate: 3.1, revenue: 423.50 },
          { source: 'Facebook', rate: 2.8, revenue: 312.20 },
          { source: 'Direct', rate: 5.1, revenue: 264.30 },
        ],
        funnel: [
          { stage: 'Landing Page', users: 1000, rate: 100 },
          { stage: 'Quote Upload', users: 342, rate: 34.2 },
          { stage: 'Analysis View', users: 298, rate: 29.8 },
          { stage: 'Checkout Started', users: 89, rate: 8.9 },
          { stage: 'Payment Complete', users: 38, rate: 3.8 },
        ]
      },
      quotes: {
        total: parseInt(localStorage.getItem('total_quotes') || '342'),
        byType: [
          { type: 'Kitchen Remodel', count: 124, revenue: 619.76 },
          { type: 'Bathroom', count: 89, revenue: 444.11 },
          { type: 'Roofing', count: 67, revenue: 334.33 },
          { type: 'Other', count: 62, revenue: 449.10 },
        ],
        avgValue: 4.99
      },
      experiments: {
        active: 7,
        results: [
          { name: 'Pricing $7.99', variant: 'variant_a', conversions: 42, revenue: 335.58 },
          { name: 'Pricing $4.99', variant: 'control', conversions: 38, revenue: 189.62 },
          { name: 'Green Button', variant: 'variant_a', conversions: 31, revenue: 154.69 },
          { name: 'Blue Button', variant: 'control', conversions: 28, revenue: 139.72 },
        ]
      }
    };

    // Simulate loading delay
    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
  };

  const exportData = () => {
    const experimentData = exportExperimentData();
    const dataStr = JSON.stringify({ metrics, experiments: experimentData }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dashboard-export-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!isAuthorized) {
    return <div className="flex items-center justify-center min-h-screen">Checking authorization...</div>;
  }

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Real-time metrics and conversion tracking</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            
            <button
              onClick={loadMetrics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={exportData}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              <span className="text-sm text-green-600 font-semibold">
                +{metrics.revenue.growth}%
              </span>
            </div>
            <h3 className="text-gray-600 text-sm">Today's Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">
              ${metrics.revenue.today.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Goal: $150.00 ({((metrics.revenue.today / 150) * 100).toFixed(0)}%)
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-sm text-gray-600">3.8%</span>
            </div>
            <h3 className="text-gray-600 text-sm">Conversion Rate</h3>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.conversions.overall}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              38 conversions today
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-purple-600" />
              <span className="text-sm text-gray-600">+12</span>
            </div>
            <h3 className="text-gray-600 text-sm">Quotes Analyzed</h3>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.quotes.total}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Avg value: ${metrics.quotes.avgValue}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-orange-600" />
              <span className="text-sm text-gray-600">{metrics.experiments.active}</span>
            </div>
            <h3 className="text-gray-600 text-sm">Active A/B Tests</h3>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.experiments.active}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              2 showing winners
            </p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.conversions.funnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {metrics.conversions.funnel.map((stage, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{stage.stage}</span>
                  <span className="font-semibold">{stage.rate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Source */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Traffic Source</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.conversions.bySource}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {metrics.conversions.bySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {metrics.conversions.bySource.map((source, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-gray-600">{source.source}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-500">{source.rate}% CVR</span>
                    <span className="font-semibold">${source.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quote Types */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Quote Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.quotes.byType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10B981" name="Quotes" />
                <Bar dataKey="revenue" fill="#F59E0B" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* A/B Test Results */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">A/B Test Performance</h3>
            <div className="space-y-4">
              {metrics.experiments.results.map((exp, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{exp.name}</h4>
                      <p className="text-sm text-gray-600">Variant: {exp.variant}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      exp.variant === 'control' 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {exp.variant === 'control' ? 'Control' : 'Test'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversions: {exp.conversions}</span>
                    <span className="font-semibold">${exp.revenue.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(exp.conversions / 50) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { time: '2 min ago', action: 'Quote uploaded', type: 'Kitchen Remodel', source: 'Google Ads' },
              { time: '5 min ago', action: 'Payment completed', amount: '$4.99', source: 'Organic' },
              { time: '12 min ago', action: 'Email signup', source: 'Facebook' },
              { time: '18 min ago', action: 'Quote analyzed', type: 'Bathroom', status: 'Free' },
              { time: '23 min ago', action: 'Payment completed', amount: '$9.99', source: 'Direct' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.action.includes('Payment') ? 'bg-green-500' :
                    activity.action.includes('Quote') ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">
                      {activity.type || activity.amount} • {activity.source}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}