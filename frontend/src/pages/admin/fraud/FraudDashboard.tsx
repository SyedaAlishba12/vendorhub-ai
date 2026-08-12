'use client';
/**
 * pages/admin/fraud/FraudDashboard.tsx
 *
 * Admin Fraud Monitoring dashboard — Option A (buildable-now tier).
 *
 * Data sources: risk_reports + messages + conversations (shared Neon DB).
 * NO dependency on Zainab's Order/Review/Rating/Shipment tables.
 *
 * Layout
 * ------
 * Row 0 — Page header + last-refresh + reload button
 * Row 1 — 3 KPI cards (total flagged vendors · multi-flag vendors · bad-cert vendors)
 *           Each card shows the counting unit explicitly ("vendors – latest report only")
 *           so it's never confused with "6 flag occurrences (all reports)" in the chart.
 * Row 2 — High-risk vendor table (full width) — sortable, expandable rows
 * Row 3 — Flag frequency chart (left) | Deterioration panel (right)
 * Row 4 — Messaging anomalies panel (full width) — tabbed
 *
 * Design tokens: identical to AnalyticsDashboard.tsx and admin/reports/page.tsx.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldAlert, ShieldX, AlertTriangle, TrendingDown,
  MessageSquare, RefreshCw, Loader2,
} from 'lucide-react';

import { Card } from '@/components/UI/Card';
import { FraudKpiCard }           from '@/components/admin/fraud/FraudKpiCard';
import { FlaggedVendorTable }     from '@/components/admin/fraud/FlaggedVendorTable';
import { FlagFrequencyChart }     from '@/components/admin/fraud/FlagFrequencyChart';
import { DeteriorationPanel }     from '@/components/admin/fraud/DeteriorationPanel';
import { MessagingAnomaliesPanel } from '@/components/admin/fraud/MessagingAnomaliesPanel';

import {
  getFlaggedVendors,
  getDeteriorationData,
  getMessagingAnomalies,
  getFlagFrequency,
  type FlaggedVendorsData,
  type DeteriorationData,
  type MessagingAnomaliesData,
  type FlagFrequencyData,
} from '@/components/admin/fraud/api';

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-slate-100 animate-pulse rounded-xl ${className}`} />;
}

// ── Composite state ──────────────────────────────────────────────────────────
interface FraudData {
  flagged:    FlaggedVendorsData;
  deteritn:   DeteriorationData;
  messaging:  MessagingAnomaliesData;
  flags:      FlagFrequencyData;
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function FraudDashboard() {
  const [data,        setData]        = useState<FraudData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [flagged, deteritn, messaging, flags] = await Promise.all([
        getFlaggedVendors(),
        getDeteriorationData(),
        getMessagingAnomalies(),
        getFlagFrequency(),
      ]);
      setData({ flagged, deteritn, messaging, flags });
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load fraud monitoring data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full min-h-screen p-6 bg-slate-50/50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-sm">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-slate-800 mb-1">Failed to load fraud data</h2>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={load}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── KPI values (computed once data is available) ────────────────────────────
  const summary = data?.flagged.summary;

  return (
    <div className="w-full min-h-screen p-6 space-y-6 bg-slate-50/50">

      {/* ── Row 0: Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-red-500 p-1.5 rounded-lg">
              <ShieldAlert size={16} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Admin Fraud Monitoring
            </h1>
          </div>
          <p className="text-slate-500 text-xs mt-1.5">
            Risk signals from <span className="font-semibold">risk_reports</span>,{' '}
            <span className="font-semibold">messages</span>, and{' '}
            <span className="font-semibold">conversations</span> · Latest vendor state only where noted
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-[10px] text-slate-400 hidden sm:block">
              Refreshed {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 transition shadow-sm disabled:opacity-50"
          >
            {loading
              ? <Loader2 size={13} className="animate-spin" />
              : <RefreshCw size={13} />}
            Refresh
          </button>
        </div>
      </div>

      {/* ── Row 1: KPI cards ───────────────────────────────────────────────── */}
      {/*
          COUNTING-UNIT NOTE (required):
          These three cards all count VENDORS (distinct vendor_id, latest report only).
          The flag frequency chart below counts REPORT OCCURRENCES (all historical rows).
          Both the `unit` prop and the card subtitle make this explicit so the two
          numbers — "1 flagged vendor" vs "6 flag occurrences" — can't be misread.
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading || !summary ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <FraudKpiCard
              title="Flagged Vendors"
              value={summary.total_flagged}
              unit="vendors — latest report only, deduplicated"
              detail={`score < ${data?.flagged.thresholds.score_threshold}, ≥${data?.flagged.thresholds.multi_flag_min} flags, or bad cert`}
              icon={<ShieldAlert size={20} />}
              iconBg="bg-red-50"
              iconText="text-red-500"
              valueText="text-red-600"
            />
            <FraudKpiCard
              title="Multi-Flag Vendors"
              value={summary.multi_flag_count}
              unit="vendors — latest report only, deduplicated"
              detail={`≥${data?.flagged.thresholds.multi_flag_min} fraud_indicators fired simultaneously`}
              icon={<AlertTriangle size={20} />}
              iconBg="bg-orange-50"
              iconText="text-orange-500"
              valueText="text-orange-600"
            />
            <FraudKpiCard
              title="Bad Cert Status"
              value={summary.bad_cert_count}
              unit="vendors — latest report only, deduplicated"
              detail="expired or unverified certification"
              icon={<ShieldX size={20} />}
              iconBg="bg-amber-50"
              iconText="text-amber-500"
              valueText="text-amber-600"
            />
          </>
        )}
      </div>

      {/* ── Row 2: Flagged vendor table ────────────────────────────────────── */}
      <Card
        title="High-Risk Vendor List"
        subtitle="One row per vendor · Latest report only · Click a row to expand AI recommendation"
        badge={loading ? '…' : `${data?.flagged.flagged_vendors.length ?? 0} vendors`}
      >
        {loading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        ) : (
          <FlaggedVendorTable vendors={data?.flagged.flagged_vendors ?? []} />
        )}
      </Card>

      {/* ── Row 3: Flag frequency + Deterioration ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Fraud Flag Frequency"
          subtitle="All historical reports — not deduplicated by vendor"
          badge={loading ? '…' : `${data?.flags.fraud_flag_frequency.length ?? 0} distinct flags`}
        >
          {loading ? (
            <Skeleton className="h-32" />
          ) : (
            <FlagFrequencyChart data={data!.flags} />
          )}
        </Card>

        <Card
          title="Score Deterioration"
          subtitle="Vendors whose latest score dropped ≥15 pts vs. their prior report"
          badge={
            loading
              ? '…'
              : data?.deteritn.summary.total_deteriorated === 0
                ? 'None detected'
                : `${data?.deteritn.summary.total_deteriorated} vendors`
          }
        >
          {loading ? (
            <Skeleton className="h-32" />
          ) : (
            <DeteriorationPanel
              vendors={data!.deteritn.deteriorated_vendors}
              minDropThreshold={data!.deteritn.summary.min_drop_threshold}
              avgDrop={data!.deteritn.summary.avg_drop}
            />
          )}
        </Card>
      </div>

      {/* ── Row 4: Messaging anomalies ─────────────────────────────────────── */}
      <Card
        title="Messaging Anomalies"
        subtitle="Derived from messages + conversations tables only — no order/review data"
        badge={<span className="flex items-center gap-1"><MessageSquare size={10} /> Messaging layer</span>}
      >
        {loading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        ) : (
          <MessagingAnomaliesPanel data={data!.messaging} />
        )}
      </Card>

    </div>
  );
}
