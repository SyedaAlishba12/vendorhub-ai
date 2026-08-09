'use client';

import { DollarSign, TrendingUp } from 'lucide-react';

interface Spending {
  monthly: number;
  last_month: number;
  total: number;
}

export default function SpendingSummary({ spending }: { spending: Spending }) {
  const format = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const stats = [
    { label: 'This Month', value: format(spending?.monthly ?? 0) },
    { label: 'Last Month', value: format(spending?.last_month ?? 0) },
    { label: 'Total Spent', value: format(spending?.total ?? 0) },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-50 p-2 rounded-xl"><DollarSign className="h-5 w-5 text-emerald-600" /></div>
        <h2 className="text-sm font-bold text-slate-900">Spending Summary</h2>
      </div>
      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between bg-slate-50/60 border border-slate-100 rounded-xl p-3">
            <div>
              <p className="text-[10px] text-slate-500">{stat.label}</p>
              <p className="text-base font-bold text-slate-900">{stat.value}</p>
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
        ))}
      </div>
    </div>
  );
}