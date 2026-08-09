'use client';
/**
 * components/admin/fraud/DeteriorationPanel.tsx
 *
 * Table of vendors whose latest overall_risk_score dropped ≥15 pts vs.
 * their immediately prior report.
 *
 * Deliberate empty state: shows a friendly "no deteriorations detected"
 * message rather than blank space — expected on a dataset where vendors
 * only have one report each (no prior to compare against).
 */

import React from 'react';
import { TrendingDown, TrendingUp, ShieldCheck } from 'lucide-react';
import type { DeterioratedVendor } from './api';

interface Props {
  vendors: DeterioratedVendor[];
  minDropThreshold: number;   // rendered in the empty state for context
  avgDrop: number;
}

function certColour(status: string) {
  switch (status) {
    case 'verified':   return 'text-emerald-600';
    case 'pending':    return 'text-amber-600';
    case 'expired':    return 'text-red-600';
    case 'unverified': return 'text-slate-500';
    default:           return 'text-slate-500';
  }
}

export function DeteriorationPanel({ vendors, minDropThreshold, avgDrop }: Props) {
  // ── Deliberate empty state ──────────────────────────────────────────────────
  if (vendors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <TrendingUp size={28} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-700">
            No significant score drops detected
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            No vendor has shown a drop of {minDropThreshold}+ points between consecutive assessments.
            This panel activates once vendors have ≥2 reports to compare.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] text-slate-400 font-medium">
          Threshold: latest vs. immediately prior report · Min drop: {minDropThreshold} pts
        </div>
      </div>
    );
  }

  // ── Results table ───────────────────────────────────────────────────────────
  return (
    <div>
      {/* Summary bar */}
      {avgDrop > 0 && (
        <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-xs">
          <TrendingDown size={14} className="text-red-500 flex-shrink-0" />
          <span className="text-red-700 font-semibold">
            {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} showing score deterioration
          </span>
          <span className="text-red-400 ml-auto">avg drop: <strong>{avgDrop} pts</strong></span>
        </div>
      )}

      <p className="text-[10px] text-slate-400 mb-2 font-medium">
        Compares each vendor's latest report against their immediately prior report · Threshold: {minDropThreshold} pts drop
      </p>

      <table className="w-full text-left text-xs text-slate-700">
        <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-200">
          <tr>
            <th className="p-3">Vendor ID</th>
            <th className="p-3">Prior Score</th>
            <th className="p-3">Latest Score</th>
            <th className="p-3">Drop</th>
            <th className="p-3">Cert Status</th>
            <th className="p-3">Active Flags</th>
            <th className="p-3">Assessed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vendors.map((v) => (
            <tr key={v.vendor_id} className="hover:bg-slate-50 transition">
              <td className="p-3 font-mono text-[10px] text-slate-400">
                {v.vendor_id.slice(0, 8)}…
              </td>
              <td className="p-3 font-bold text-slate-500">
                {v.prior_score}<span className="font-normal text-[9px] text-slate-300">/100</span>
              </td>
              <td className="p-3 font-black text-red-600">
                {v.latest_score}<span className="font-normal text-[9px] text-slate-300">/100</span>
              </td>
              <td className="p-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[11px] font-bold">
                  <TrendingDown size={11} />
                  −{v.score_drop}
                </span>
              </td>
              <td className={`p-3 font-semibold capitalize text-[11px] ${certColour(v.certification_status)}`}>
                {v.certification_status}
              </td>
              <td className="p-3">
                {v.latest_fraud_flags.length === 0 ? (
                  <span className="text-slate-300 text-[10px]">—</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {v.latest_fraud_flags.map(f => (
                      <span key={f} className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-orange-50 text-orange-800 border border-orange-200">
                        {f.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td className="p-3 text-[10px] text-slate-400 whitespace-nowrap">
                {new Date(v.latest_assessed_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
