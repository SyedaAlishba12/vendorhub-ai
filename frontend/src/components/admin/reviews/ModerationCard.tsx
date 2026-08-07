'use client';

import React from 'react';
import { CheckCircle, Trash2, FileText, AlertTriangle } from 'lucide-react';

interface ModerationCardProps {
  item: any;
  onSelectDetails: (item: any) => void;
  onModerate: (reviewId: string, action: 'APPROVE' | 'REJECT' | 'REMOVE') => void;
}

export function ModerationCard({ item, onSelectDetails, onModerate }: ModerationCardProps) {
  const reviewId = item.review_id || item.review?.id;

  return (
    <div className="bg-white border border-slate-300 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
            Flagged Content
          </span>
          <h3 className="text-xs font-bold text-slate-900 mt-2">
            Reported By: {item.reported_by || 'Anonymous'}
          </h3>
        </div>
        <button
          onClick={() => onSelectDetails(item)}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition text-xs flex items-center gap-1"
        >
          <FileText size={14} /> Details
        </button>
      </div>

      <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-xl text-xs space-y-1">
        <div className="font-semibold text-amber-800 flex items-center gap-1">
          <AlertTriangle size={13} /> Reason:
        </div>
        <p className="text-amber-900">{item.reason || 'No specific reason provided.'}</p>
      </div>

      {item.review && (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
          <div className="font-bold text-slate-900">{item.review.buyer_name || 'Buyer'}</div>
          <p className="mt-1 italic">"{item.review.comment}"</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onModerate(reviewId, 'APPROVE')}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
        >
          <CheckCircle size={14} /> Approve
        </button>
        <button
          onClick={() => onModerate(reviewId, 'REMOVE')}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition"
        >
          <Trash2 size={14} /> Remove
        </button>
      </div>
    </div>
  );
}