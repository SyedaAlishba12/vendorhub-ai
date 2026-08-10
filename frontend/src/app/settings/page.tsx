'use client';

/**
 * app/settings/page.tsx
 *
 * System Settings — AI Provider Integration Hub.
 *
 * Layout convention: identical to FraudDashboard.tsx and AnalyticsDashboard.tsx:
 *   - Page header row (title + subtitle + last-checked + reload button)
 *   - Section label "AI Providers" above a vertical card list
 *   - One card per integration — structured as a list so future cards
 *     slot in below with no restructuring.
 *
 * Card design tokens match FraudKpiCard / AnalyticsDashboard StatCard:
 *   bg-white rounded-2xl border border-slate-200/90 shadow-sm
 *
 * Status badge colour map:
 *   connected      → emerald (green)
 *   quota_exceeded → amber
 *   no_key         → rose (red)
 *   error          → rose (red)
 *
 * API: GET /api/integrations/status via apiClient (same axios convention as
 * Risk/fraud api.ts — apiClient.get<{ success: bool; data: T }>(path)).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, RefreshCw, Loader2, CheckCircle2,
  AlertTriangle, XCircle, KeyRound, Clock, Settings2,
} from 'lucide-react';
import apiClient from '@/utils/api/apiClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IntegrationStatus = 'connected' | 'quota_exceeded' | 'no_key' | 'error';

interface IntegrationEntry {
  provider: string;
  model: string;
  status: IntegrationStatus;
  fallback_active: boolean;
  checked_at: string;       // ISO-8601 UTC
  detail: string;
}

interface StatusResponse {
  integrations: IntegrationEntry[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format an ISO timestamp as a relative "N minutes ago" string. */
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffS = Math.floor(diffMs / 1000);
  if (diffS < 5) return 'just now';
  if (diffS < 60) return `${diffS} seconds ago`;
  const diffM = Math.floor(diffS / 60);
  if (diffM < 60) return `${diffM} minute${diffM !== 1 ? 's' : ''} ago`;
  const diffH = Math.floor(diffM / 60);
  return `${diffH} hour${diffH !== 1 ? 's' : ''} ago`;
}

// Status display config — keeps the render logic clean
const STATUS_CONFIG: Record<
  IntegrationStatus,
  {
    label: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    iconEl: React.ReactNode;
    ringColor: string;
  }
> = {
  connected: {
    label: 'Connected',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    iconEl: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    ringColor: 'ring-emerald-400/20',
  },
  quota_exceeded: {
    label: 'Quota Exceeded',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-700',
    iconEl: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    ringColor: 'ring-amber-400/20',
  },
  no_key: {
    label: 'No API Key',
    badgeBg: 'bg-red-50',
    badgeBorder: 'border-red-200',
    badgeText: 'text-red-700',
    iconEl: <KeyRound className="h-5 w-5 text-red-500" />,
    ringColor: 'ring-red-400/20',
  },
  error: {
    label: 'Error',
    badgeBg: 'bg-red-50',
    badgeBorder: 'border-red-200',
    badgeText: 'text-red-700',
    iconEl: <XCircle className="h-5 w-5 text-red-500" />,
    ringColor: 'ring-red-400/20',
  },
};

// ---------------------------------------------------------------------------
// API call — matches apiClient convention from Risk/fraud api.ts
// ---------------------------------------------------------------------------

async function fetchIntegrationStatus(): Promise<IntegrationEntry[]> {
  const res = await apiClient.get<{ success: boolean; data: StatusResponse }>(
    '/integrations/status',
  );
  return res.data.data.integrations;
}

// ---------------------------------------------------------------------------
// Sub-component: one integration card
// Designed so future cards (OpenAI, Anthropic…) render identically below.
// ---------------------------------------------------------------------------

function IntegrationCard({
  entry,
  onTestConnection,
  testing,
}: {
  entry: IntegrationEntry;
  onTestConnection: () => void;
  testing: boolean;
}) {
  const cfg = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.error;

  return (
    // Card token: identical to FraudKpiCard / AnalyticsDashboard StatCard
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col gap-4">
      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Provider icon badge */}
          <span className={`flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 ring-4 ${cfg.ringColor}`}>
            <Sparkles className="h-5 w-5 text-indigo-600" />
          </span>
          <div>
            <p className="text-sm font-black text-slate-900 leading-tight">{entry.provider}</p>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Model: <code className="font-mono">{entry.model}</code>
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wide border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText} shrink-0`}>
          {cfg.iconEl}
          {cfg.label}
        </span>
      </div>

      {/* ── Info grid ── */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Fallback status */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
            Rule-based Fallback
          </p>
          <p className={`text-xs font-bold ${entry.fallback_active ? 'text-amber-600' : 'text-emerald-600'}`}>
            {entry.fallback_active ? 'Active — AI unavailable' : 'Inactive — AI responding'}
          </p>
        </div>

        {/* Last checked */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
            Last Checked
          </p>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400 shrink-0" />
            <p className="text-xs font-bold text-slate-700">
              {relativeTime(entry.checked_at)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Detail / note ── */}
      {entry.status !== 'connected' && (
        <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Note</p>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-3">
            {entry.detail}
          </p>
        </div>
      )}

      {/* ── Footer: Test Connection ── */}
      <div className="mt-4 flex justify-end">
        <button
          id={`test-connection-${entry.provider.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={onTestConnection}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700
              hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-700 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <RefreshCw className="h-3.5 w-3.5" />
          }
          {testing ? 'Testing…' : 'Test Connection'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<IntegrationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null); // provider being tested
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // ── Load all integrations ─────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIntegrationStatus();
      setIntegrations(data);
      setLastRefresh(new Date());
    } catch (e: unknown) {
      const axiosErr = e as { message?: string };
      setError(axiosErr?.message ?? 'Failed to load integration status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Per-card "Test Connection" — re-fetches and updates just that card ────
  const handleTest = useCallback(async (provider: string) => {
    setTesting(provider);
    try {
      const data = await fetchIntegrationStatus();
      setIntegrations(data);
      setLastRefresh(new Date());
    } catch {
      // Keep existing cards visible; don't blow out the page on a test failure
    } finally {
      setTesting(null);
    }
  }, []);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`bg-slate-100 animate-pulse rounded-xl ${className}`} />;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page header — same structure as FraudDashboard header row ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 border border-slate-200">
            <Settings2 className="h-5 w-5 text-slate-600" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              AI provider health, API key status, and fallback configuration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {lastRefresh && (
            <span className="text-[11px] font-semibold text-slate-400">
              Updated {relativeTime(lastRefresh.toISOString())}
            </span>
          )}
          <button
            id="settings-reload-btn"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200
              text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900
              transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <RefreshCw className="h-3.5 w-3.5" />
            }
            Refresh
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Section: AI Providers ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              AI Providers
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time connection status for each configured AI service.
              Rule-based fallbacks activate automatically when a provider is unavailable.
            </p>
          </div>
        </div>

        {/* Card list — one card per integration.
            Future providers (OpenAI, Anthropic, etc.) append here. */}
        <div className="space-y-4">
          {loading && integrations.length === 0 ? (
            // Loading skeleton — matches card proportions
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-7 w-32 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
              <Skeleton className="h-12 rounded-xl" />
            </div>
          ) : integrations.length === 0 && !loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-10 text-center text-slate-400 text-sm font-semibold">
              No integrations configured.
            </div>
          ) : (
            integrations.map((entry) => (
              <IntegrationCard
                key={entry.provider}
                entry={entry}
                testing={testing === entry.provider}
                onTestConnection={() => handleTest(entry.provider)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Future integrations placeholder section ── */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Coming Soon
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {['Shipment Tracking (DHL / FedEx)', 'Email Notifications (SendGrid)', 'SMS Alerts (Twilio)'].map((name) => (
            <div
              key={name}
              className="bg-white rounded-2xl border border-slate-200/90 border-dashed shadow-none p-4 flex items-center gap-3 opacity-50"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 border border-slate-200">
                <Settings2 className="h-4 w-4 text-slate-400" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-500">{name}</p>
                <p className="text-[10px] text-slate-400 font-medium">Not configured</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
