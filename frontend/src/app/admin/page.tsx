'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Users, Building2, Package, DollarSign, CreditCard } from 'lucide-react';
import apiClient from '../../utils/api/apiClient';

interface AdminOverview {
  total_users: number;
  total_vendors: number;
  total_orders: number;
  total_revenue: number;
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, subRes] = await Promise.all([
        apiClient.get('/admin/overview'),
        apiClient.get('/admin/subscribers'),
      ]);
      setOverview(overviewRes.data);
      setSubscribers(Array.isArray(subRes.data) ? subRes.data : []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50/50">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen p-6 bg-slate-50/50">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-sm max-w-md mx-auto mt-20">
          <p className="text-sm text-rose-700">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const planCounts: Record<string, number> = subscribers.reduce((acc: Record<string, number>, s: any) => {
    const plan = s.plan_name || 'Unknown';
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});

  const statCards = [
    { label: 'Total Users', value: overview?.total_users ?? 0, icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { label: 'Total Vendors', value: overview?.total_vendors ?? 0, icon: <Building2 size={20} />, color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { label: 'Total Orders', value: overview?.total_orders ?? 0, icon: <Package size={20} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { label: 'Total Revenue', value: `$${(overview?.total_revenue ?? 0).toLocaleString()}`, icon: <DollarSign size={20} />, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  ];

  return (
    <div className="w-full min-h-screen p-6 space-y-6 bg-slate-50/50">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-xs mt-1">Platform overview and subscription analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-slate-300 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</span>
              <h3 className="text-2xl font-extrabold mt-1 text-slate-900">{s.value}</h3>
            </div>
            <div className={`p-3 rounded-xl border ${s.color}`}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={16} className="text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Subscriptions by Plan</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(planCounts).length > 0 ? (
            Object.entries(planCounts).map(([plan, count]) => (
              <div key={plan} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-slate-900">{count}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{plan}</p>
              </div>
            ))
          ) : (
            <p className="col-span-4 text-center text-slate-400 text-xs">No subscribers yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}