'use client';

import React from 'react';

interface ReportStatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: 'blue' | 'amber' | 'red';
}

export function ReportStatCard({ title, value, icon, variant = 'blue' }: ReportStatCardProps) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  const textStyles = {
    blue: 'text-slate-900',
    amber: 'text-amber-600',
    red: 'text-red-600',
  };

  return (
    <div className="bg-white border border-slate-300 p-5 rounded-2xl flex items-center justify-between shadow-sm">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <h3 className={`text-2xl font-extrabold mt-1 ${textStyles[variant]}`}>{value}</h3>
      </div>
      <div className={`p-3 rounded-xl border ${colorStyles[variant]}`}>
        {icon}
      </div>
    </div>
  );
}