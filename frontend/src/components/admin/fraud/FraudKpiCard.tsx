'use client';
/**
 * components/admin/fraud/FraudKpiCard.tsx
 *
 * A single KPI card for the Fraud Signal Dashboard.
 * Mirrors the AnalyticsDashboard StatCard visually (same rounded-2xl, border-slate-200/90).
 *
 * IMPORTANT — counting-unit labelling requirement:
 * Every card must make clear whether the number represents:
 *   • "vendors" → distinct vendor IDs (one entry per vendor, latest report only)
 *   • "reports"  → all historical risk_reports rows (one per assessment run)
 *   • "convos"   → conversation rows
 * The `unit` prop is required and rendered below the big number so the two
 * metrics ("1 vendor" vs "6 report occurrences") are never ambiguous side-by-side.
 */

import React from 'react';

interface FraudKpiCardProps {
  /** Short headline, e.g. "Flagged Vendors" */
  title: string;
  /** The big number */
  value: number;
  /** What the number counts — always shown below the value for disambiguation */
  unit: string;               // e.g. "vendors (deduplicated)" | "report occurrences" | "conversations"
  icon: React.ReactNode;
  /** Tailwind bg class for the icon area */
  iconBg: string;
  /** Tailwind text class for the icon */
  iconText: string;
  /** Tailwind text class for the big number */
  valueText: string;
  /** Optional secondary line, e.g. threshold description */
  detail?: string;
}

export function FraudKpiCard({
  title,
  value,
  unit,
  icon,
  iconBg,
  iconText,
  valueText,
  detail,
}: FraudKpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex items-center gap-4">
      <div className={`${iconBg} ${iconText} p-3 rounded-xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide truncate">
          {title}
        </p>
        <p className={`text-2xl font-black leading-none mt-0.5 ${valueText}`}>
          {value}
        </p>
        {/* Counting-unit label — always rendered, never optional */}
        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
          {unit}
        </p>
        {detail && (
          <p className="text-[10px] text-slate-300 mt-0.5 italic">{detail}</p>
        )}
      </div>
    </div>
  );
}
