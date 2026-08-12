'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, FileText } from 'lucide-react';
import apiClient from '../../utils/api/apiClient';
import RFQStatusBadge from '../../components/rfq/RFQStatusBadge';

interface RFQItem {
  id: number;
  rfq_ref: string;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  created_at: string;
}

export default function RFQPage() {
  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/rfq');
      setRfqs(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">RFQ Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Create, send, and track quotes</p>
        </div>
        <Link
          href="/rfq/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
        >
          <Plus className="h-4 w-4" /> New RFQ
        </Link>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {rfqs.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <FileText className="h-10 w-10 mx-auto mb-4 text-slate-300" />
            <p className="font-semibold">No RFQs yet</p>
            <p className="text-sm mt-1">Create your first RFQ to start sourcing.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">RFQ Ref</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Qty</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {rfqs.map((rfq) => (
                <tr key={rfq.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <Link href={`/rfq/${rfq.id}`} className="font-bold text-indigo-600 hover:underline">
                      {rfq.rfq_ref}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{rfq.product_name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{rfq.category}</td>
                  <td className="py-3.5 px-4">{rfq.quantity} {rfq.unit}</td>
                  <td className="py-3.5 px-4"><RFQStatusBadge status={rfq.status} /></td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(rfq.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}