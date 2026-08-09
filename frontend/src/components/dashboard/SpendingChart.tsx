'use client';

interface SpendingChartProps {
  data: Array<{ month: string; amount: number }>;
}

export default function SpendingChart({ data }: SpendingChartProps) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900 mb-4">Spending Trend (6 months)</h2>
      <div className="flex items-end gap-2 h-32">
        {data.map((d, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-slate-500">${(d.amount / 1000).toFixed(1)}k</span>
            <div
              className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-all"
              style={{ height: `${(d.amount / max) * 100}%`, minHeight: '4px' }}
            />
            <span className="text-[10px] text-slate-400">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}