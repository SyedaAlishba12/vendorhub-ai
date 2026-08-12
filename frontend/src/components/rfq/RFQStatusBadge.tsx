'use client';

export default function RFQStatusBadge({ status }: { status: string }) {
  const getStyles = () => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-600';
      case 'sent': return 'bg-blue-50 text-blue-700';
      case 'quoted': return 'bg-emerald-50 text-emerald-700';
      case 'closed': return 'bg-purple-50 text-purple-700';
      case 'cancelled': return 'bg-rose-50 text-rose-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${getStyles()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}