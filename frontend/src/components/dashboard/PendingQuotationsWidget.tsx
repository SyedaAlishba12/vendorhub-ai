'use client';

import { MessageSquare, TrendingUp } from 'lucide-react';

interface QuotationItem {
  id: number;
  rfq_ref: string;
  product_name: string;
  quantity: number;
  unit: string;
  status: string;
}

export default function PendingQuotationsWidget({ quotes = [] }: { quotes: QuotationItem[] }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-purple-50 p-2 rounded-xl"><MessageSquare className="h-5 w-5 text-purple-600" /></div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Pending Quotations</h2>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{quotes.length} quotes waiting</p>
        </div>
      </div>
      <div className="space-y-3">
        {quotes.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No pending quotations yet.</p>
        ) : (
          quotes.map((quote) => (
            <div key={quote.id} className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{quote.product_name}</h4>
                  <p className="text-[10px] text-slate-500">{quote.rfq_ref}</p>
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-[10px] text-slate-500">{quote.quantity} {quote.unit}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}