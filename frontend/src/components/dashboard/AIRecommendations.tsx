'use client';

import { Sparkles, ArrowRight } from 'lucide-react';

interface Recommendation {
  title: string;
  description: string;
  action?: string;
}

export default function AIRecommendations({ recommendations = [] }: { recommendations: Recommendation[] }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-50 p-2 rounded-xl"><Sparkles className="h-5 w-5 text-indigo-600" /></div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">AI Recommendations</h2>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Personalized insights for you</p>
        </div>
      </div>
      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No recommendations yet.</p>
        ) : (
          recommendations.map((rec, idx) => (
            <div key={idx} className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5 hover:border-indigo-200 transition-all">
              <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
              <p className="text-[10px] text-slate-500 mt-1">{rec.description}</p>
              {rec.action && (
                <ArrowRight className="h-4 w-4 text-indigo-600 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}