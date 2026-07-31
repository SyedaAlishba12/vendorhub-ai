import React from 'react';

export const Pagination: React.FC<{ currentPage: number; totalPages: number }> = ({ currentPage, totalPages }) => (
  <div className="flex items-center justify-between border-t border-slate-200 pt-4 px-2">
    <p className="text-xs text-slate-500">
      Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
    </p>
    <div className="flex items-center gap-1.5">
      <button className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
        Previous
      </button>
      <button className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
        Next
      </button>
    </div>
  </div>
);