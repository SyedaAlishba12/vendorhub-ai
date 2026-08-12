'use client';

import { Activity, FileText, ShoppingCart } from 'lucide-react';

interface ActivityItem {
  type: string;
  title: string;
  description: string;
  time: string;
}

export default function ActivityTimeline({ activities = [] }: { activities: ActivityItem[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'rfq': return <FileText className="h-3.5 w-3.5" />;
      case 'order': return <ShoppingCart className="h-3.5 w-3.5" />;
      default: return <Activity className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-rose-50 p-2 rounded-xl"><Activity className="h-5 w-5 text-rose-600" /></div>
        <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
      </div>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No activities yet.</p>
        ) : (
          activities.map((act, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
                {getIcon(act.type)}
              </div>
              <div>
                <p className="text-[11px] text-slate-700">{act.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{act.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}