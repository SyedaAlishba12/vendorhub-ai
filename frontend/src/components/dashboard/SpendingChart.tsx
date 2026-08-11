'use client';

interface SpendingChartProps {
  data: Array<{
    month: string;
    amount: number;
  }>;
}

export default function SpendingChart({
  data,
}: SpendingChartProps) {
  const max = Math.max(
    ...data.map((item) => item.amount),
    1
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
      
      <h2 className="text-sm font-bold text-slate-900 mb-4">
        Spending Trend (6 months)
      </h2>

      <div className="flex items-end gap-3 h-40">
        
        {data.map((item, index) => {
          const height =
            item.amount > 0
              ? `${(item.amount / max) * 100}%`
              : '4px';

          return (
            <div
              key={`${item.month}-${index}`}
              className="flex-1 flex flex-col items-center justify-end gap-2"
            >

              {/* Amount */}
              <span className="text-[10px] text-slate-500 font-medium">
                ${item.amount.toLocaleString()}
              </span>

              {/* Bar */}
              <div
                className="w-full max-w-12 bg-indigo-500 rounded-t-lg hover:bg-indigo-600 transition-all"
                style={{
                  height,
                  minHeight: '4px',
                }}
                title={`${item.month}: $${item.amount.toLocaleString()}`}
              />

              {/* Month */}
              <span className="text-[10px] text-slate-400 font-medium">
                {item.month}
              </span>

            </div>
          );
        })}

      </div>

      {/* Empty state */}
      {data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-xs text-slate-400">
            No spending data available.
          </p>
        </div>
      )}

    </div>
  );
}
