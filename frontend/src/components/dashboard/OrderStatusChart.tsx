'use client';

interface OrderStatusChartProps {
  data: Record<string, number>;
}

export default function OrderStatusChart({ data }: OrderStatusChartProps) {
  const colors: Record<string, string> = {
    PROCESSING: 'bg-amber-400',
    SHIPPED: 'bg-blue-400',
    DELIVERED: 'bg-emerald-400',
    CANCELLED: 'bg-rose-400',
  };

  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900 mb-4">Order Status</h2>
      <div className="flex h-3 rounded-full overflow-hidden mb-3">
        {Object.entries(data).map(([status, count]) => (
          <div
            key={status}
            className={`${colors[status] || 'bg-slate-400'} h-full`}
            style={{ width: `${(count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(data).map(([status, count]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-slate-400'}`} />
            <span className="text-[11px] text-slate-500 capitalize">{status.toLowerCase()}</span>
            <span className="text-xs font-bold text-slate-700 ml-auto">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}