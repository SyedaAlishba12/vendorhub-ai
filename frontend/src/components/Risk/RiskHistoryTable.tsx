'use client';
/**
 * components/Risk/RiskHistoryTable.tsx
 * Table of past risk reports with clickable rows.
 */

import React from 'react';
import { RiskReport, getRiskTier, RISK_TIER_CONFIG } from './types';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  reports: RiskReport[];
  onSelect: (report: RiskReport) => void;
  selectedId?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export const RiskHistoryTable: React.FC<Props> = ({ reports, onSelect, selectedId }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-slate-400">
        No history yet. Run an analysis to start building a history.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Date</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Overall</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Financial</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Delivery</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Tier</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Flags</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, i) => {
            const tier = getRiskTier(report.overall_risk_score);
            const config = RISK_TIER_CONFIG[tier];
            const isSelected = report.id === selectedId;
            const prev = reports[i + 1];
            const delta = prev ? report.overall_risk_score - prev.overall_risk_score : null;

            return (
              <tr
                key={report.id}
                onClick={() => onSelect(report)}
                className={`border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${
                  isSelected ? 'bg-indigo-50 border-indigo-100' : ''
                }`}
              >
                <td className="py-2.5 px-3 text-xs text-slate-500 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-slate-300" />
                    {formatDate(report.created_at)}
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span className={`font-black text-sm ${config.text}`}>
                      {report.overall_risk_score}
                    </span>
                    {delta !== null && (
                      <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {delta >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        {Math.abs(delta)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-3 text-xs font-medium text-slate-600">{report.financial_risk_score}</td>
                <td className="py-2.5 px-3 text-xs font-medium text-slate-600">{report.delivery_risk_score}</td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${config.bg} ${config.border} ${config.text}`}>
                    {config.label}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-xs text-slate-400">
                  {report.fraud_indicators.length === 0
                    ? <span className="text-emerald-500 font-medium">None</span>
                    : <span className="text-orange-500 font-medium">{report.fraud_indicators.length} flag{report.fraud_indicators.length > 1 ? 's' : ''}</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
