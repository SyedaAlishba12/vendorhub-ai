'use client';

import { Package } from 'lucide-react';

interface OrdersSummaryProps {
  summary: {
    total: number;
    in_transit: number;
    delivered: number;
  };
}

export default function OrdersSummary({ summary }: OrdersSummaryProps) {
  const orderStats = [
    { label: 'Total Orders', value: summary.total ?? 0, icon: '📦' },
    { label: 'In Transit', value: summary.in_transit ?? 0, icon: '🚚' },
    { label: 'Delivered', value: summary.delivered ?? 0, icon: '✅' },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-blue-50 p-2 rounded-xl"><Package className="h-5 w-5 text-blue-600" /></div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Orders Summary</h2>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Your recent orders status</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {orderStats.map((stat) => (
          <div key={stat.label} className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 text-center">
            <p className="text-lg mb-1">{stat.icon}</p>
            <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-[10px] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}