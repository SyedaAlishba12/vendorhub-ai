'use client';
/**
 * components/admin/fraud/FlaggedVendorTable.tsx
 *
 * Sortable table of vendors whose latest risk report triggered at least one
 * high-risk criterion (score < 40, ≥2 fraud_indicators, or expired/unverified cert).
 *
 * Each row renders fraud_indicators as badge chips (same orange palette as
 * FraudIndicatorList.tsx) and a flag_reasons column showing which criteria fired.
 *
 * Scope note: "latest report per vendor" — one row per distinct vendor_id,
 * not one row per historical risk_reports row. This is surfaced in the
 * column header so it's never ambiguous.
 */

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import type { FlaggedVendor } from './api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFlag(flag: string): string {
  return flag.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function scoreBadge(score: number) {
  if (score < 40) return 'bg-red-50 text-red-700 border-red-200';
  if (score < 60) return 'bg-orange-50 text-orange-700 border-orange-200';
  if (score < 80) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

function certBadge(status: string) {
  switch (status) {
    case 'verified':   return { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <ShieldCheck size={11} className="inline mr-0.5" /> };
    case 'pending':    return { cls: 'bg-amber-50   text-amber-700   border-amber-200',   icon: <ShieldAlert size={11} className="inline mr-0.5" /> };
    case 'expired':    return { cls: 'bg-red-50     text-red-700     border-red-200',     icon: <ShieldX    size={11} className="inline mr-0.5" /> };
    case 'unverified': return { cls: 'bg-slate-50   text-slate-600   border-slate-200',   icon: <ShieldX    size={11} className="inline mr-0.5" /> };
    default:           return { cls: 'bg-slate-50   text-slate-600   border-slate-200',   icon: null };
  }
}

function flagReasonChip(reason: string) {
  switch (reason) {
    case 'critical_score':      return 'bg-red-50 text-red-700 border-red-200';
    case 'multiple_fraud_flags': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'bad_certification':   return 'bg-amber-50 text-amber-700 border-amber-200';
    default:                    return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

function flagReasonLabel(reason: string) {
  switch (reason) {
    case 'critical_score':       return 'Critical Score';
    case 'multiple_fraud_flags': return '≥2 Flags';
    case 'bad_certification':    return 'Bad Cert';
    default: return reason;
  }
}

type SortKey = 'overall_risk_score' | 'flag_count' | 'last_assessed_at';
type SortDir = 'asc' | 'desc';

interface Props {
  vendors: FlaggedVendor[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FlaggedVendorTable({ vendors }: Props) {
  const [sortKey, setSortKey]   = useState<SortKey>('overall_risk_score');
  const [sortDir, setSortDir]   = useState<SortDir>('asc');
  const [expanded, setExpanded] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = [...vendors].sort((a, b) => {
    let av: number, bv: number;
    if (sortKey === 'overall_risk_score') {
      av = a.overall_risk_score;
      bv = b.overall_risk_score;
    } else if (sortKey === 'flag_count') {
      av = a.fraud_indicators.length;
      bv = b.fraud_indicators.length;
    } else {
      av = new Date(a.last_assessed_at).getTime();
      bv = new Date(b.last_assessed_at).getTime();
    }
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronsUpDown size={12} className="inline ml-0.5 text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp   size={12} className="inline ml-0.5 text-indigo-500" />
      : <ChevronDown size={12} className="inline ml-0.5 text-indigo-500" />;
  }

  if (vendors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
        <ShieldCheck size={32} className="text-emerald-300" />
        <p className="text-sm font-semibold text-slate-500">No flagged vendors</p>
        <p className="text-xs">All vendors currently pass the risk thresholds.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Scope callout — prevents "1 vendor" vs "6 reports" misread */}
      <p className="text-[10px] text-slate-400 mb-2 font-medium">
        One row per vendor · Latest report only · Sorted by score ASC (riskiest first)
      </p>
      <table className="w-full text-left text-xs text-slate-700">
        <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-200">
          <tr>
            <th className="p-3">
              <button onClick={() => handleSort('overall_risk_score')} className="flex items-center gap-0.5 hover:text-slate-700 transition">
                Score <SortIcon k="overall_risk_score" />
              </button>
            </th>
            <th className="p-3">Vendor ID</th>
            <th className="p-3">Cert Status</th>
            <th className="p-3">
              <button onClick={() => handleSort('flag_count')} className="flex items-center gap-0.5 hover:text-slate-700 transition">
                Fraud Flags <SortIcon k="flag_count" />
              </button>
            </th>
            <th className="p-3">Criteria Triggered</th>
            <th className="p-3">
              <button onClick={() => handleSort('last_assessed_at')} className="flex items-center gap-0.5 hover:text-slate-700 transition">
                Last Assessed <SortIcon k="last_assessed_at" />
              </button>
            </th>
            <th className="p-3">AI Rec.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((v) => {
            const cert = certBadge(v.certification_status);
            const isExpanded = expanded === v.vendor_id;
            return (
              <React.Fragment key={v.vendor_id}>
                <tr
                  className="hover:bg-slate-50 cursor-pointer transition"
                  onClick={() => setExpanded(isExpanded ? null : v.vendor_id)}
                >
                  {/* Score */}
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-lg border text-[11px] font-black ${scoreBadge(v.overall_risk_score)}`}>
                      {v.overall_risk_score}
                      <span className="font-normal text-[9px]">/100</span>
                    </span>
                  </td>

                  {/* Vendor ID (truncated) */}
                  <td className="p-3 font-mono text-[10px] text-slate-400 max-w-[120px] truncate">
                    {v.vendor_id.slice(0, 8)}…
                  </td>

                  {/* Cert status */}
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-semibold ${cert.cls}`}>
                      {cert.icon}{v.certification_status}
                    </span>
                  </td>

                  {/* Fraud indicator chips */}
                  <td className="p-3">
                    {v.fraud_indicators.length === 0 ? (
                      <span className="text-slate-300 text-[10px]">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {v.fraud_indicators.map((f) => (
                          <span
                            key={f}
                            className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-orange-50 text-orange-800 border border-orange-200 whitespace-nowrap"
                          >
                            {formatFlag(f)}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Criteria triggered (flag_reasons) */}
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {v.flag_reasons.map((r) => (
                        <span
                          key={r}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${flagReasonChip(r)}`}
                        >
                          {flagReasonLabel(r)}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Last assessed */}
                  <td className="p-3 text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(v.last_assessed_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>

                  {/* AI indicator */}
                  <td className="p-3">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${v.ai_used ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {v.ai_used ? 'AI' : 'Rule'}
                    </span>
                  </td>
                </tr>

                {/* Expandable row: full recommendation text */}
                {isExpanded && (
                  <tr className="bg-indigo-50/40">
                    <td colSpan={7} className="px-6 py-3">
                      <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">AI Recommendation</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{v.ai_recommendation}</p>
                      <div className="mt-2 flex gap-3 text-[10px] text-slate-400">
                        <span>Financial: <strong className="text-slate-600">{v.financial_risk_score}</strong></span>
                        <span>Delivery: <strong className="text-slate-600">{v.delivery_risk_score}</strong></span>
                        {v.business_age_years !== null && (
                          <span>Business age: <strong className="text-slate-600">{v.business_age_years}y</strong></span>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
