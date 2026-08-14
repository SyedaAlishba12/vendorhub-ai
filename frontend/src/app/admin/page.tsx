'use client';

import { useEffect, useState } from 'react';

import {
  RefreshCw,
  Users,
  Building2,
  Package,
  DollarSign,
  CreditCard,
  ShieldAlert,
  FileWarning,
  UserCheck,
  TrendingUp,
} from 'lucide-react';

import apiClient from '../../utils/api/apiClient';

interface AdminOverview {
  total_users: number;
  total_vendors: number;
  total_orders: number;
  total_revenue: number;
  pending_vendor_verifications?: number;
  total_reports?: number;
  fraud_alerts?: number;
  active_subscribers?: number;
}

export default function AdminDashboardPage() {

  const [overview, setOverview] =
    useState<AdminOverview | null>(null);

  const [subscribers, setSubscribers] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {

    try {

      setLoading(true);
      setError(null);

      const requests = [
        apiClient.get('/admin/overview'),
        apiClient.get('/admin/subscribers'),
      ];

      const [
        overviewRes,
        subscribersRes,
      ] = await Promise.all(requests);

      setOverview(overviewRes.data);

      setSubscribers(
        Array.isArray(subscribersRes.data)
          ? subscribersRes.data
          : []
      );

    } catch (err: any) {

      console.error(
        'Failed to load admin dashboard:',
        err
      );

      setError(
        err?.response?.data?.detail ||
        'Failed to load admin dashboard.'
      );

    } finally {

      setLoading(false);

    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">

        <RefreshCw
          className="h-8 w-8 text-indigo-600 animate-spin"
        />

      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {

    return (
      <div className="min-h-screen p-6 bg-slate-50">

        <div className="max-w-md mx-auto mt-20 bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-sm">

          <FileWarning
            className="mx-auto text-rose-500 mb-3"
            size={28}
          />

          <p className="text-sm font-semibold text-rose-700">
            {error}
          </p>

          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  /* =====================================================
     SUBSCRIPTION COUNTS
  ===================================================== */

  const planCounts: Record<string, number> =
    subscribers.reduce(
      (
        acc: Record<string, number>,
        subscriber: any
      ) => {

        const plan =
          subscriber.plan_name ||
          'Unknown';

        acc[plan] =
          (acc[plan] || 0) + 1;

        return acc;

      },
      {}
    );

  /* =====================================================
     STAT CARDS
  ===================================================== */

  const statCards = [

    {
      label: 'Total Users',
      value:
        overview?.total_users ?? 0,
      icon: Users,
      color:
        'bg-blue-50 text-blue-600 border-blue-200',
    },

    {
      label: 'Total Vendors',
      value:
        overview?.total_vendors ?? 0,
      icon: Building2,
      color:
        'bg-purple-50 text-purple-600 border-purple-200',
    },

    {
      label: 'Total Orders',
      value:
        overview?.total_orders ?? 0,
      icon: Package,
      color:
        'bg-emerald-50 text-emerald-600 border-emerald-200',
    },

    {
      label: 'Total Revenue',
      value:
        `$${(
          overview?.total_revenue ?? 0
        ).toLocaleString()}`,
      icon: DollarSign,
      color:
        'bg-amber-50 text-amber-600 border-amber-200',
    },

    {
      label: 'Active Subscribers',
      value:
        overview?.active_subscribers ??
        subscribers.length,
      icon: CreditCard,
      color:
        'bg-indigo-50 text-indigo-600 border-indigo-200',
    },

    {
      label: 'Pending Vendor Verification',
      value:
        overview?.pending_vendor_verifications ??
        0,
      icon: UserCheck,
      color:
        'bg-orange-50 text-orange-600 border-orange-200',
    },

    {
      label: 'Reports',
      value:
        overview?.total_reports ?? 0,
      icon: FileWarning,
      color:
        'bg-rose-50 text-rose-600 border-rose-200',
    },

    {
      label: 'Fraud Alerts',
      value:
        overview?.fraud_alerts ?? 0,
      icon: ShieldAlert,
      color:
        'bg-red-50 text-red-600 border-red-200',
    },

  ];

  return (

    <div className="w-full min-h-screen p-6 space-y-6 bg-slate-50/50">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">

          <div>

            <div className="flex items-center gap-2">

              <TrendingUp
                size={20}
                className="text-indigo-600"
              />

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Platform Analytics
              </h1>

            </div>

            <p className="text-slate-500 text-xs mt-1">
              Monitor users, vendors, orders, revenue, subscriptions, reports, and platform activity.
            </p>

          </div>

          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-xl text-xs font-bold text-slate-600 transition"
          >
            <RefreshCw size={14} />

            Refresh
          </button>

        </div>

        {/* =================================================
            OVERVIEW CARDS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {statCards.map((stat) => {

            const Icon = stat.icon;

            return (

              <div
                key={stat.label}
                className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm"
              >

                <div className="min-w-0">

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </span>

                  <h3 className="text-2xl font-extrabold mt-1 text-slate-900">
                    {stat.value}
                  </h3>

                </div>

                <div
                  className={`p-3 rounded-xl border ${stat.color}`}
                >
                  <Icon size={20} />
                </div>

              </div>

            );
          })}

        </div>

        {/* =================================================
            SUBSCRIPTIONS
        ================================================= */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center gap-2 mb-4">

            <CreditCard
              size={16}
              className="text-indigo-600"
            />

            <h2 className="text-sm font-bold text-slate-900">
              Subscriptions by Plan
            </h2>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {Object.keys(planCounts).length > 0 ? (

              Object.entries(planCounts).map(
                ([plan, count]) => (

                  <div
                    key={plan}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center"
                  >

                    <p className="text-2xl font-black text-slate-900">
                      {count}
                    </p>

                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                      {plan}
                    </p>

                  </div>

                )
              )

            ) : (

              <p className="col-span-4 text-center text-slate-400 text-xs py-4">
                No subscribers yet.
              </p>

            )}

          </div>

        </div>

        {/* =================================================
            ADMIN RESPONSIBILITIES
        ================================================= */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Administration Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">

              <Users
                size={18}
                className="text-blue-600 mb-2"
              />

              <p className="text-xs font-bold text-slate-900">
                Manage Users
              </p>

              <p className="text-[10px] text-slate-500 mt-1">
                User accounts and access
              </p>

            </div>

            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">

              <Building2
                size={18}
                className="text-purple-600 mb-2"
              />

              <p className="text-xs font-bold text-slate-900">
                Verify Vendors
              </p>

              <p className="text-[10px] text-slate-500 mt-1">
                Review vendor verification
              </p>

            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">

              <CreditCard
                size={18}
                className="text-indigo-600 mb-2"
              />

              <p className="text-xs font-bold text-slate-900">
                Subscription Plans
              </p>

              <p className="text-[10px] text-slate-500 mt-1">
                Manage pricing plans
              </p>

            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">

              <FileWarning
                size={18}
                className="text-amber-600 mb-2"
              />

              <p className="text-xs font-bold text-slate-900">
                Reports
              </p>

              <p className="text-[10px] text-slate-500 mt-1">
                Review platform reports
              </p>

            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">

              <ShieldAlert
                size={18}
                className="text-rose-600 mb-2"
              />

              <p className="text-xs font-bold text-slate-900">
                Fraud Monitoring
              </p>

              <p className="text-[10px] text-slate-500 mt-1">
                Monitor suspicious activity
              </p>

            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">

              <TrendingUp
                size={18}
                className="text-emerald-600 mb-2"
              />

              <p className="text-xs font-bold text-slate-900">
                Platform Analytics
              </p>

              <p className="text-[10px] text-slate-500 mt-1">
                Track platform performance
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

