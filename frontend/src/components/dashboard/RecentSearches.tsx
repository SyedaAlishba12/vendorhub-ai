'use client';

import { History, X } from 'lucide-react';

export default function RecentSearches({ searches = [], onRemove }: { searches: string[]; onRemove?: (index: number) => void }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-cyan-50 p-2 rounded-xl"><History className="h-5 w-5 text-cyan-600" /></div>
        <h2 className="text-sm font-bold text-slate-900">Recent Searches</h2>
      </div>
      <div className="space-y-2">
        {searches.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No recent searches.</p>
        ) : (
          searches.map((search, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-50/60 border border-slate-100 rounded-xl px-3 py-2">
              <span className="text-[11px] text-slate-700">{search}</span>
              {onRemove && (
                <button onClick={() => onRemove(idx)} className="text-slate-400 hover:text-rose-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}