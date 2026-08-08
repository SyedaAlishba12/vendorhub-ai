'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock } from 'lucide-react';
import { ModerationCard } from '../../../components/admin/reviews/ModerationCard';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api").replace(/\/api\/?$/, '');

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [reportedQueue, setReportedQueue] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchReportedReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews/reported`);
      if (res.ok) {
        const data = await res.json();
        setReportedQueue(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch reported queue:', e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews/moderation-history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch moderation history:', e);
    }
  };

  useEffect(() => {
    fetchReportedReviews();
    fetchHistory();
  }, []);

  // 👈 Fixed: URL parameters format added for FastAPI compatibility
  const handleModerate = async (reviewId: string, action: 'APPROVE' | 'REJECT' | 'REMOVE') => {
    try {
      const queryParams = new URLSearchParams({
        action: action,
        admin_notes: adminNotes || ''
      });

      const res = await fetch(`${API_BASE}/api/admin/reviews/${reviewId}/moderate?${queryParams.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        alert(`Review action [${action}] applied successfully.`);
        setSelectedReport(null);
        setAdminNotes('');
        fetchReportedReviews();
        fetchHistory();
      } else {
        alert('Failed to process moderation request.');
      }
    } catch (e) {
      console.error('Moderation error:', e);
      alert('Failed to process moderation request.');
    }
  };

  return (
    <div className="w-full min-h-screen p-6 space-y-6 bg-slate-50/50">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Review Moderation</h1>
        <p className="text-slate-500 text-xs mt-1">Manage flagged content, review reports queue, and audit logs</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'queue'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShieldAlert size={16} /> Reported Queue ({reportedQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Clock size={16} /> Moderation History
        </button>
      </div>

      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportedQueue.length > 0 ? (
            reportedQueue.map((item) => (
              <ModerationCard
                key={item.id}
                item={item}
                onSelectDetails={(selected) => setSelectedReport(selected)}
                onModerate={handleModerate}
              />
            ))
          ) : (
            <div className="col-span-2 text-center text-slate-400 py-16 bg-white border border-slate-200 rounded-2xl text-xs">
              No reported reviews currently pending in queue.
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Report ID</th>
                <th className="p-3">Review ID</th>
                <th className="p-3">Reported By</th>
                <th className="p-3">Status Action</th>
                <th className="p-3">Admin Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length > 0 ? (
                history.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-[11px] text-slate-500">{log.id}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{log.review_id}</td>
                    <td className="p-3 font-semibold">{log.reported_by || 'User'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        log.status?.includes('APPROVED')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{log.admin_notes || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No moderation history logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Report Content Details</h2>
            <div className="space-y-2 text-xs">
              <div><span className="font-semibold text-slate-500">Reason:</span> {selectedReport.reason}</div>
              <div><span className="font-semibold text-slate-500">Reported By:</span> {selectedReport.reported_by}</div>
              <div>
                <span className="font-semibold text-slate-500">Admin Resolution Notes:</span>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Optional admin action note..."
                  className="w-full mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}