'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import apiClient from '../../../utils/api/apiClient';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/subscribers');
      setSubscribers(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6 space-y-6 bg-slate-50/50">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Subscribers</h1>
        <p className="text-slate-500 text-xs mt-1">All active and past subscriptions</p>
      </div>

      {error && <div className="text-red-600 text-xs">{error}</div>}

      <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-200">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Status</th>
              <th className="p-3">Start Date</th>
              <th className="p-3">Renewal Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscribers.length > 0 ? (
              subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{s.user_email || 'N/A'}</td>
                  <td className="p-3">{s.plan_name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3">{s.start_date?.slice(0, 10)}</td>
                  <td className="p-3">{s.renewal_date?.slice(0, 10)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">No subscribers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}