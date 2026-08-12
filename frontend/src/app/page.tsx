'use client';

import React, { useEffect, useState } from 'react';

import {
  Sparkles,
  Search,
  SlidersHorizontal,
  Settings,
} from 'lucide-react';

import apiClient from '../utils/api/apiClient';

import StatCard from '../components/dashboard/StatCard';
import ActiveRFQsWidget from '../components/dashboard/ActiveRFQsWidget';
import PendingQuotationsWidget from '../components/dashboard/PendingQuotationsWidget';
import OrdersSummary from '../components/dashboard/OrdersSummary';
import SavedVendors from '../components/dashboard/SavedVendors';
import AIRecommendations from '../components/dashboard/AIRecommendations';
import RecentSearches from '../components/dashboard/RecentSearches';
import SpendingSummary from '../components/dashboard/SpendingSummary';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import QuickActions from '../components/dashboard/QuickActions';
import SpendingChart from '../components/dashboard/SpendingChart';
import RFQStatusChart from '../components/dashboard/RFQStatusChart';
import OrderStatusChart from '../components/dashboard/OrderStatusChart';
import RecentRFQsTable from '../components/dashboard/RecentRFQsTable';

interface DashboardData {
  stats: {
    active_rfqs: number;
    pending_quotations: number;
    total_orders: number;
    total_vendors: number;
    total_spending: number;
    monthly_spending: number;
  };

  recent_rfqs: Array<{
    id: number;
    rfq_ref: string;
    product_name: string;
    quantity: number;
    unit: string;
    status: string;
    ai_score?: number;
    target_region?: string;
  }>;

  active_rfqs: Array<{
    id: number;
    rfq_ref: string;
    product_name: string;
    quantity: number;
    unit: string;
    budget?: number;
    status: string;
    created_at: string;
  }>;

  pending_quotations: Array<{
    id: number;
    rfq_ref: string;
    product_name: string;
    quantity: number;
    unit: string;
    status: string;
  }>;

  orders_summary: {
    total: number;
    in_transit: number;
    delivered: number;
  };

  saved_vendors: Array<{
    name: string;
    rating: number;
    location: string;
    verified: boolean;
  }>;

  recent_searches: string[];

  spending: {
    monthly: number;
    last_month: number;
    total: number;
  };

  activity: Array<{
    type: string;
    title: string;
    description: string;
    time: string;
  }>;

  recommendations: Array<{
    title: string;
    description: string;
    action?: string;
  }>;
}

interface StatisticsData {
  monthly_spending_trend: Array<{
    month: string;
    amount: number;
  }>;

  rfq_status_distribution: {
    draft: number;
    sent: number;
    quoted: number;
    closed: number;
    cancelled: number;
  };

  order_status_distribution: {
    PROCESSING: number;
    SHIPPED: number;
    DELIVERED: number;
    CANCELLED: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  const [statistics, setStatistics] =
    useState<StatisticsData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // -------------------------
      // Dashboard Data
      // -------------------------

      const dashboardRes =
        await apiClient.get('/dashboard/buyer');

      setData(dashboardRes.data);

      // -------------------------
      // Statistics
      // -------------------------

      try {
        const statsRes =
          await apiClient.get('/dashboard/statistics');

        setStatistics(statsRes.data);
      } catch (err) {
        console.warn(
          'Failed to fetch statistics:',
          err
        );

        setStatistics(null);
      }
    } catch (err: any) {
      console.error(
        'Error fetching dashboard:',
        err
      );

      setError(
        err.response?.data?.detail ||
          'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // -------------------------
  // Loading State
  // -------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // -------------------------
  // Error State
  // -------------------------

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm max-w-md w-full">
          <h2 className="text-sm font-bold text-rose-700">
            Error Loading Dashboard
          </h2>

          <p className="text-xs text-slate-500 mt-2">
            {error}
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">

      {/* =========================
          Hero Banner
      ========================= */}

      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative">
        <div className="flex items-start gap-3">
          <div className="bg-white/10 p-2.5 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Next-Gen AI Procurement
            </p>

            <h1 className="text-2xl font-black mt-1">
              Welcome back! Ready to source smarter?
            </h1>

            <p className="text-sm text-indigo-100 mt-2 max-w-2xl">
              Your AI-powered procurement dashboard.
              Create RFQs, track quotations, and find
              verified suppliers instantly.
            </p>

            <QuickActions />
          </div>
        </div>

        {/* Dashboard Settings */}
        <button
          type="button"
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white transition-all"
          title="Dashboard Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* =========================
          AI Search Bar
      ========================= */}

      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <div className="pl-3 text-indigo-600">
          <Sparkles className="h-5 w-5" />
        </div>

        <input
          type="text"
          placeholder="Describe your sourcing requirement..."
          className="w-full text-xs text-slate-700 bg-transparent outline-none placeholder:text-slate-400 font-medium"
        />

        <button
          type="button"
          className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
          title="Search filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          <Search className="h-4 w-4" />

          <span>AI Search</span>
        </button>
      </div>

      {/* =========================
          Statistics Cards
      ========================= */}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <StatCard
            title="Active RFQs"
            value={data.stats.active_rfqs}
            trend="+12% this month"
            icon={
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            }
            color="bg-blue-50 border-blue-200"
          />

          <StatCard
            title="Pending Quotations"
            value={data.stats.pending_quotations}
            trend="Awaiting responses"
            icon={
              <svg
                className="h-5 w-5 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="bg-yellow-50 border-yellow-200"
          />

          <StatCard
            title="Verified Vendors"
            value={data.stats.total_vendors}
            trend="Saved vendors"
            icon={
              <svg
                className="h-5 w-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
            color="bg-emerald-50 border-emerald-200"
          />

        </div>
      )}

      {/* =========================
          Charts
      ========================= */}

      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <SpendingChart
            data={statistics.monthly_spending_trend}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RFQStatusChart
              data={statistics.rfq_status_distribution}
            />

            <OrderStatusChart
              data={statistics.order_status_distribution}
            />
          </div>

        </div>
      )}

      {/* =========================
          Recent RFQs
      ========================= */}

      {data && (
        <RecentRFQsTable
          rfqs={data.recent_rfqs}
        />
      )}

      {/* =========================
          Spending / Revenue Insights
      ========================= */}

      {data && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Revenue Insights
            </h2>

            <p className="text-[11px] text-slate-500 mt-0.5">
              Your total spend and savings opportunities
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black text-slate-900">
              ${data.spending.total.toLocaleString()}
            </p>

            <p className="text-[10px] text-emerald-600 font-bold">
              +15% vs last year
            </p>
          </div>
        </div>
      )}

      {/* =========================
          Main Dashboard Content
      ========================= */}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            <ActiveRFQsWidget
              rfqs={data.active_rfqs}
            />

            <PendingQuotationsWidget
              quotes={data.pending_quotations}
            />

            <RecentSearches
              searches={data.recent_searches}
            />

            <ActivityTimeline
              activities={data.activity}
            />

          </div>

          {/* Right Column */}
          <div className="space-y-6">

            <OrdersSummary
              summary={data.orders_summary}
            />

            <SavedVendors
              vendors={data.saved_vendors}
            />

            <AIRecommendations
              recommendations={data.recommendations}
            />

            <SpendingSummary
              spending={data.spending}
            />

          </div>

        </div>
      )}

    </div>
  );
}