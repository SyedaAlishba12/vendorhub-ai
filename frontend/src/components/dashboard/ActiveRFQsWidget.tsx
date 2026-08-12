'use client';

import { FileText, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RFQItem {
  id: number;
  rfq_ref: string;
  product_name: string;
  quantity: number;
  unit: string;
  budget?: number;
  status: string;
  created_at: string;
}

export default function ActiveRFQsWidget({ rfqs = [] }: { rfqs: RFQItem[] }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Active RFQs</h2>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Manage your quotation requests</p>
        </div>
        <Link href="/rfq/create" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all">
          <Plus className="h-4 w-4" />
          New RFQ
        </Link>
      </div>
      <div className="space-y-3">
        {rfqs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No active RFQs yet.</p>
        ) : (
          rfqs.map((rfq) => (
            <div key={rfq.id} className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5 hover:bg-slate-50 hover:border-slate-200 transition-all group cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-slate-900">{rfq.product_name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{rfq.rfq_ref} · {rfq.status}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                    <span>{rfq.quantity} {rfq.unit}</span>
                    {rfq.budget && <span>Budget: ${rfq.budget.toLocaleString()}</span>}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}