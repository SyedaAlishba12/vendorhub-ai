'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { ReportStatCard } from '../../components/admin/reports/ReportStatCard';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api").replace(/\/api\/?$/, '');

export default function AdminReportsPage() {
  const [orderReports, setOrderReports] = useState<any>(null);
  const [disputes, setDisputes] = useState<any[]>([]);

  const fetchOrderReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reports/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrderReports(data);
      }
    } catch (e) {
      console.error('Failed to load order reports:', e);
    }
  };

  const fetchDisputes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/disputes`);
      if (res.ok) {
        const data = await res.json();
        setDisputes(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load disputes:', e);
    }
  };

  useEffect(() => {
    fetchOrderReports();
    fetchDisputes();
  }, []);

  const handleExportPDF = () => {
    window.open(`${API_BASE}/api/admin/reports/export`, '_blank');
  };

  return (
    <div className="w-full min-h-screen p-6 space-y-6 bg-slate-50/50">
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Reports & Disputes</h1>
          <p className="text-slate-500 text-xs mt-1">Cross-module analytics, PDF exports, and order disputes</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-semibold text-white transition shadow-md shadow-indigo-200"
        >
          <Download size={15} /> Export Platform Report (PDF)
        </button>
      </div>

      {orderReports && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReportStatCard
            title="Total System Orders"
            value={orderReports.total_orders || 0}
            icon={<FileSpreadsheet size={24} />}
            variant="blue"
          />
          <ReportStatCard
            title="Cancelled Orders"
            value={orderReports.cancelled_orders || 0}
            icon={<AlertTriangle size={24} />}
            variant="amber"
          />
          <ReportStatCard
            title="Active Disputes"
            value={orderReports.disputed_orders || disputes.length || 0}
            icon={<AlertTriangle size={24} />}
            variant="red"
          />
        </div>
      )}

      <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Dispute Records (Cancellation & Claims)</h2>
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-200">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Buyer ID</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Dispute Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {disputes.length > 0 ? (
              disputes.map((disp) => (
                <tr key={disp.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-[11px] text-slate-500">{disp.id}</td>
                  <td className="p-3 font-semibold">{disp.buyer_id || 'N/A'}</td>
                  <td className="p-3 text-slate-600">{disp.dispute_reason || 'Order Cancellation Requested'}</td>
                  <td className="p-3">
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-md text-[10px] font-semibold">
                      Under Admin Review
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">
                  No active disputes or cancellation claims recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}