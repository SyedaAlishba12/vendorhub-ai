'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ModerationCardProps {
  item: any;
  onSelectDetails: (item: any) => void;
  onModerate: (reviewId: string, action: 'APPROVE' | 'REJECT' | 'REMOVE') => void;
}

export function ModerationCard({ item, onSelectDetails, onModerate }: ModerationCardProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{item.review_title || 'Review'}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">ID: {item.id}</p>
        </div>
        <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
          Flagged
        </span>
      </div>

      <p className="text-xs text-slate-600 line-clamp-3">{item.review_content || item.reason || 'No content'}</p>
      <p className="text-[11px] text-slate-400">Reason: {item.reason || 'Pending review'}</p>

      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onSelectDetails(item)}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
        >
          View Details
        </button>
        <button
          onClick={() => onModerate(item.review_id || item.id, 'APPROVE')}
          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold"
        >
          <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" /> Approve
        </button>
        <button
          onClick={() => onModerate(item.review_id || item.id, 'REMOVE')}
          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold"
        >
          <XCircle className="h-3.5 w-3.5 inline mr-1" /> Remove
        </button>
      </div>
    </div>
  );
}