'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  RefreshCw,
  LogOut,
  Users,
  CreditCard,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import type { AdminMetrics, AdminTimeRange } from '@/lib/admin-metrics';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<AdminTimeRange>('week');
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/session');
      if (response.ok) {
        const data = await response.json();
        setIsAuthorized(true);
        setAdminEmail(data.email);
        return true;
      }
      setIsAuthorized(false);
      return false;
    } catch {
      setIsAuthorized(false);
      return false;
    } finally {
      setAuthChecking(false);
    }
  }, []);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/metrics?range=${timeRange}`);
      if (response.status === 401) {
        setIsAuthorized(false);
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load metrics');
      }
      const data = (await response.json()) as AdminMetrics;
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthorized) {
      loadMetrics();
    }
  }, [isAuthorized, loadMetrics]);

  async function handleLogout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    setIsAuthorized(false);
    setAdminEmail(null);
    setMetrics(null);
  }

  if (authChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <AdminLogin
        onAuthenticated={(email) => {
          setAdminEmail(email);
          setIsAuthorized(true);
        }}
      />
    );
  }

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-gray-600">{error || 'Unable to load dashboard'}</p>
        <button
          onClick={loadMetrics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const revenueBySource = metrics.conversions.bySource.length > 0
    ? metrics.conversions.bySource
    : [{ source: 'No paid sessions yet', rate: 0, revenue: 0, count: 0 }];

  const quoteTypes = metrics.quotes.byType.length > 0
    ? metrics.quotes.byType
    : [{ type: 'No quotes yet', count: 0, revenue: 0 }];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">
              Live metrics · Signed in as {adminEmail}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Updated {new Date(metrics.generatedAt).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as AdminTimeRange)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <button
              onClick={loadMetrics}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                const dataStr = JSON.stringify(metrics, null, 2);
                const dataUri =
                  'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                const link = document.createElement('a');
                link.href = dataUri;
                link.download = `admin-export-${new Date().toISOString()}.json`;
                link.click();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 bg-white"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 bg-white"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Data source status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Stripe', active: metrics.dataSources.stripe },
            { label: 'Firestore', active: metrics.dataSources.firestore },
            { label: 'Mailchimp', active: metrics.dataSources.mailchimp },
          ].map(({ label, active }) => (
            <div
              key={label}
              className={`text-sm px-4 py-2 rounded-lg border ${
                active
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}
            >
              {label}: {active ? 'Connected' : 'Not configured'}
            </div>
          ))}
        </div>

        {!metrics.dataSources.firestore && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            Add <code className="bg-amber-100 px-1 rounded">FIREBASE_SERVICE_ACCOUNT_KEY</code> to
            your environment to enable quote counts and activity from Firestore.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              <span
                className={`text-sm font-semibold ${
                  metrics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metrics.revenue.growth >= 0 ? '+' : ''}
                {metrics.revenue.growth.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-gray-600 text-sm">
              {timeRange === 'today' ? "Today's Revenue" : 'Period Revenue'}
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              ${(timeRange === 'today' ? metrics.revenue.today : metrics.revenue.period).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Today: ${metrics.revenue.today.toFixed(2)} · Goal: $150 (
              {metrics.revenue.goalProgress.toFixed(0)}%)
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-sm text-gray-600">
                {metrics.conversions.checkoutCompleted} paid
              </span>
            </div>
            <h3 className="text-gray-600 text-sm">Checkout Conversion</h3>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.conversions.overall.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {metrics.conversions.checkoutStarted} started · MRR: $
              {metrics.revenue.mrr.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-purple-600" />
              <span className="text-sm text-gray-600">+{metrics.quotes.period}</span>
            </div>
            <h3 className="text-gray-600 text-sm">Quotes Analyzed</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.quotes.total}</p>
            <p className="text-xs text-gray-500 mt-2">
              {metrics.quotes.period} in selected period
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-orange-600" />
              <span className="text-sm text-gray-600">{metrics.subscriptions.active} active</span>
            </div>
            <h3 className="text-gray-600 text-sm">Email Subscribers</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.emailSignups.total}</p>
            <p className="text-xs text-gray-500 mt-2">
              {metrics.subscriptions.active} subscriptions · {metrics.stripeSummary.totalCustomers}{' '}
              Stripe customers
            </p>
          </div>
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Week Revenue', value: `$${metrics.revenue.week.toFixed(2)}` },
            { label: 'Month Revenue', value: `$${metrics.revenue.month.toFixed(2)}` },
            { label: 'Stripe Charges (30d)', value: metrics.stripeSummary.totalCharges },
            { label: 'Canceled Subs', value: metrics.subscriptions.canceled },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.conversions.funnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" angle={-25} textAnchor="end" height={80} fontSize={11} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Source</h3>
            {metrics.conversions.bySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueBySource}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percent }) =>
                      `${source} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    dataKey="revenue"
                  >
                    {revenueBySource.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
                No checkout revenue in this period yet
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Quote Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quoteTypes.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" fontSize={11} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" name="Quotes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Types</h3>
            <div className="space-y-3">
              {metrics.quotes.byAnalysisType.length > 0 ? (
                metrics.quotes.byAnalysisType.map((item) => (
                  <div key={item.type} className="flex justify-between items-center border rounded-lg p-3">
                    <span className="font-medium capitalize text-gray-900">{item.type}</span>
                    <span className="text-gray-600">{item.count} quotes</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No quote data available</p>
              )}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">External Analytics</h4>
              <div className="space-y-2">
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Analytics (funnel & A/B tests)
                </a>
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Stripe Dashboard
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-2">{metrics.experiments.note}</p>
            </div>
          </div>
        </div>

        {/* Recent Stripe Payments */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Recent Stripe Payments
            </h3>
          </div>
          {metrics.stripeSummary.recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Product</th>
                    <th className="pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.stripeSummary.recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-gray-600">
                        {new Date(payment.created).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4">{payment.email || '—'}</td>
                      <td className="py-2 pr-4 capitalize">
                        {payment.productType.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2 font-semibold">${payment.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent payments found</p>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {metrics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {metrics.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.action.includes('Payment')
                          ? 'bg-green-500'
                          : activity.action.includes('Quote')
                            ? 'bg-blue-500'
                            : 'bg-purple-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">
                        {[activity.detail, activity.amount, activity.source]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
