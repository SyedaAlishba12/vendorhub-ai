'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: string;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({
  title,
  value,
  trend,
  icon,
  color = 'bg-white border-slate-200',
}: StatCardProps) {
  return (
    <div className={`${color} p-5 rounded-2xl border shadow-sm flex items-start gap-4`}>
      {icon && (
        <div className="p-2 rounded-xl bg-white/70 shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-500">{title}</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
        {trend && (
          <p className="text-[10px] text-slate-400 font-medium mt-1">{trend}</p>
        )}
      </div>
    </div>
  );
}