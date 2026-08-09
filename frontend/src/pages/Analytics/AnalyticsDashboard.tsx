'use client';
/**
 * pages/Analytics/AnalyticsDashboard.tsx
 *
 * Risk Analytics Dashboard — consumes GET /api/risk/analytics.
 * Visual style matches risk-analysis/page.tsx and admin/reports/page.tsx:
 *   • Same Card component, same Tailwind classes, same chart.js + react-chartjs-2 stack.
 *   • No new design patterns introduced.
 *
 * Widgets:
 *   Row 0  — Page header (sticky)
 *   Row 1  — Summary stat cards (total_reports, distinct_vendors, avg_overall_score)
 *   Row 2  — Score distribution bar chart  |  Score trend line chart
 *   Row 3  — Fraud flag frequency table    |  AI usage stat + donut
 *   Row 4  — Cert status breakdown bar     |  Messaging activity stats + bar chart
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3, Bot, MessageSquare, RefreshCw,
  ShieldAlert, ShieldCheck, Sparkles, TrendingUp, Users,
} from 'lucide-react';

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import { Card } from '@/components/UI/Card';
import { getRiskAnalytics, type AnalyticsData } from '@/components/Analytics/api';

ChartJS.register(
  ArcElement, BarElement, CategoryScale, Filler, Legend,
  LinearScale, LineElement, PointElement, Title, Tooltip,
);

// ── Colour palette (consistent with existing indigo/emerald/amber tokens) ────
const C = {
  indigo:  '#6366f1',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#f43f5e',
  violet:  '#8b5cf6',
  slate:   '#64748b',
  grid:    'rgba(0,0,0,0.04)',
  indigoFill: 'rgba(99,102,241,0.10)',
  emeraldFill: 'rgba(16,185,129,0.12)',
};

const CERT_COLOURS: Record<string, string> = {
  verified:   C.emerald,
  pending:    C.amber,
  expired:    C.rose,
  unverified: C.slate,
};

// ── Shared chart options helpers ─────────────────────────────────────────────
const baseBarOpts = (maxVal?: number) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { bodyFont: { size: 11 } },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: maxVal,
      ticks: { font: { size: 10 }, stepSize: 1, precision: 0 },
      grid: { color: C.grid },
    },
    x: { ticks: { font: { size: 10 } }, grid: { display: false } },
  },
});

// ── Skeleton loader (matches existing pattern) ────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-slate-100 animate-pulse rounded-xl ${className}`} />;
}

// ── Stat card (mirrors admin/reports ReportStatCard visually) ─────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  colour: string;          // Tailwind bg class e.g. 'bg-indigo-50'
  iconColour: string;      // Tailwind text class
}
function StatCard({ label, value, sub, icon, colour, iconColour }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex items-center gap-4">
      <div className={`${colour} ${iconColour} p-3 rounded-xl`}>{icon}</div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-none mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Helper: format date labels ────────────────────────────────────────────────
function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await getRiskAnalytics(30);
      setData(result);
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // ── Score distribution bar ──────────────────────────────────────────────────
  const distChart = data ? {
    labels: data.score_distribution.map(b => b.bucket),
    datasets: [{
      label: 'Reports',
      data: data.score_distribution.map(b => b.count),
      backgroundColor: [C.rose, C.amber, C.amber, C.emerald, C.emerald],
      borderRadius: 6,
      borderSkipped: false,
    }],
  } : null;

  // ── Score trend line ────────────────────────────────────────────────────────
  const trendChart = data && data.score_trend.length > 0 ? {
    labels: data.score_trend.map(p => shortDate(p.date)),
    datasets: [{
      label: 'Avg Score',
      data: data.score_trend.map(p => p.avg_score),
      borderColor: C.indigo,
      backgroundColor: C.indigoFill,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: C.indigo,
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  } : null;

  // ── Cert status bar ─────────────────────────────────────────────────────────
  const certChart = data && data.cert_status_breakdown.length > 0 ? {
    labels: data.cert_status_breakdown.map(c => c.status.charAt(0).toUpperCase() + c.status.slice(1)),
    datasets: [{
      label: 'Reports',
      data: data.cert_status_breakdown.map(c => c.count),
      backgroundColor: data.cert_status_breakdown.map(c => CERT_COLOURS[c.status] ?? C.slate),
      borderRadius: 6,
      borderSkipped: false,
    }],
  } : null;

  // ── AI usage donut ──────────────────────────────────────────────────────────
  const aiChart = data ? {
    labels: ['AI Generated', 'Rule-based'],
    datasets: [{
      data: [data.ai_usage.ai_generated, data.ai_usage.rule_based],
      backgroundColor: [C.violet, C.slate],
      borderWidth: 0,
    }],
  } : null;

  // ── Message volume bar ──────────────────────────────────────────────────────
  const msgVolChart = data && data.messaging_activity.message_volume_by_day.length > 0 ? {
    labels: data.messaging_activity.message_volume_by_day.map(p => shortDate(p.date)),
    datasets: [{
      label: 'Messages',
      data: data.messaging_activity.message_volume_by_day.map(p => p.count),
      backgroundColor: C.emeraldFill,
      borderColor: C.emerald,
      borderWidth: 1.5,
      borderRadius: 6,
      borderSkipped: false,
    }],
  } : null;

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 space-y-5">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 rounded-2xl mb-4">
            <ShieldAlert className="h-7 w-7 text-red-400" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 mb-1">Could not load analytics</h2>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={load}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-200"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, score_distribution, score_trend, fraud_flag_frequency,
          ai_usage, cert_status_breakdown, messaging_activity } = data;

  const totalFlagOccurrences = fraud_flag_frequency.reduce((s, f) => s + f.count, 0);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-200">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900">
                Platform Analytics
                <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full uppercase tracking-wider">
                  Risk + Messaging
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Aggregated over {summary.total_reports} reports · {summary.distinct_vendors} vendor{summary.distinct_vendors !== 1 ? 's' : ''}
                {lastRefresh && (
                  <span className="ml-2 text-slate-300">
                    · refreshed {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Row 1: Summary stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Reports"
            value={summary.total_reports}
            icon={<ShieldAlert className="h-5 w-5" />}
            colour="bg-indigo-50"
            iconColour="text-indigo-600"
          />
          <StatCard
            label="Vendors Assessed"
            value={summary.distinct_vendors}
            icon={<Users className="h-5 w-5" />}
            colour="bg-violet-50"
            iconColour="text-violet-600"
          />
          <StatCard
            label="Avg Overall Score"
            value={`${summary.avg_overall_score}/100`}
            sub="Higher = safer"
            icon={<TrendingUp className="h-5 w-5" />}
            colour="bg-emerald-50"
            iconColour="text-emerald-600"
          />
          <StatCard
            label="Avg Financial"
            value={`${summary.avg_financial_score}/100`}
            icon={<ShieldCheck className="h-5 w-5" />}
            colour="bg-amber-50"
            iconColour="text-amber-600"
          />
          <StatCard
            label="Avg Delivery"
            value={`${summary.avg_delivery_score}/100`}
            icon={<Sparkles className="h-5 w-5" />}
            colour="bg-rose-50"
            iconColour="text-rose-500"
          />
        </div>

        {/* ── Row 2: Score distribution | Score trend ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Score distribution bar */}
          <Card
            title="Score Distribution"
            subtitle="Count of reports per 20-point safety bucket (higher = safer)"
          >
            {distChart && score_distribution.some(b => b.count > 0) ? (
              <div style={{ height: 200 }}>
                <Bar data={distChart} options={baseBarOpts() as any} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-xs text-slate-400">
                No data yet.
              </div>
            )}
            {/* colour legend */}
            <div className="flex gap-4 mt-3 text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-400" /> High-risk (0-39)
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" /> Moderate (40-59)
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> Safe (60-100)
              </span>
            </div>
          </Card>

          {/* Score trend line */}
          <Card
            title="Score Trend"
            subtitle="Daily average overall risk score — last 30 days"
            badge="30d"
          >
            {trendChart ? (
              <div style={{ height: 200 }}>
                <Line
                  data={trendChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx: any) => ` Avg score: ${ctx.raw}/100`,
                          afterLabel: (ctx: any) => {
                            const pt = score_trend[ctx.dataIndex];
                            return pt ? ` Reports that day: ${pt.report_count}` : '';
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        min: 0, max: 100,
                        ticks: { font: { size: 10 }, stepSize: 20 },
                        grid: { color: C.grid },
                      },
                      x: { ticks: { font: { size: 10 } }, grid: { display: false } },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-xs text-slate-400 gap-2">
                <TrendingUp className="h-6 w-6 text-slate-200" />
                No reports in the last 30 days.
              </div>
            )}
          </Card>
        </div>

        {/* ── Row 3: Fraud flags | AI usage ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Fraud flag frequency */}
          <Card
            title="Fraud Flag Frequency"
            subtitle={
              fraud_flag_frequency.length > 0
                ? `${totalFlagOccurrences} flag occurrence${totalFlagOccurrences !== 1 ? 's' : ''} across all reports`
                : 'No fraud flags raised yet'
            }
          >
            {fraud_flag_frequency.length > 0 ? (
              <div className="space-y-2.5">
                {fraud_flag_frequency.map((f) => {
                  const pct = totalFlagOccurrences > 0 ? Math.round(f.count / totalFlagOccurrences * 100) : 0;
                  return (
                    <div key={f.flag}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700">
                          {f.flag.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-bold text-rose-600 tabular-nums">
                          {f.count}×
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-rose-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-[10px] text-slate-400 pt-1">
                  Flags are raised by the rule-based scoring engine at assessment time.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-24 text-xs text-slate-400 gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
                No fraud flags detected across all reports.
              </div>
            )}
          </Card>

          {/* AI usage */}
          <Card
            title="AI Recommendation Source"
            subtitle="Gemini AI vs rule-based fallback"
            badge="ai_used"
          >
            <div className="flex items-center gap-6">

              {/* Donut — only render if either side is non-zero */}
              {(ai_usage.ai_generated > 0 || ai_usage.rule_based > 0) && aiChart ? (
                <div className="flex-shrink-0" style={{ width: 120, height: 120 }}>
                  <Doughnut
                    data={aiChart}
                    options={{
                      responsive: true,
                      cutout: '72%',
                      plugins: {
                        legend: { display: false },
                        tooltip: { bodyFont: { size: 11 } },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center">
                  <Bot className="h-7 w-7 text-slate-300" />
                </div>
              )}

              {/* Stats */}
              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">AI Generated</p>
                  <p className="text-xl font-black text-violet-600">{ai_usage.ai_generated}</p>
                  <p className="text-[10px] text-slate-400">{ai_usage.ai_generated_pct}% of all reports</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Rule-based Fallback</p>
                  <p className="text-xl font-black text-slate-600">{ai_usage.rule_based}</p>
                  <p className="text-[10px] text-slate-400">
                    {ai_usage.total_reports > 0
                      ? `${(100 - ai_usage.ai_generated_pct).toFixed(1)}% of all reports`
                      : '—'}
                  </p>
                </div>
                {ai_usage.ai_generated === 0 && (
                  <p className="text-[10px] text-amber-600 font-medium bg-amber-50 border border-amber-100 rounded-lg px-2 py-1">
                    All reports used the rule-based fallback — re-run after Gemini quota resets.
                  </p>
                )}
              </div>
            </div>

            {/* Colour legend */}
            <div className="flex gap-4 mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: C.violet }} />
                Gemini AI
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: C.slate }} />
                Rule-based
              </span>
            </div>
          </Card>
        </div>

        {/* ── Row 4: Cert breakdown | Messaging activity ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Cert status bar */}
          <Card
            title="Certification Status Breakdown"
            subtitle="Report count per vendor certification state at assessment time"
          >
            {certChart ? (
              <div style={{ height: 200 }}>
                <Bar data={certChart} options={baseBarOpts() as any} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-xs text-slate-400">
                No data yet.
              </div>
            )}
            {/* Legend pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: 'Verified',   colour: C.emerald },
                { label: 'Pending',    colour: C.amber },
                { label: 'Expired',    colour: C.rose },
                { label: 'Unverified', colour: C.slate },
              ].map(({ label, colour }) => (
                <span key={label} className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: colour }} />
                  {label}
                </span>
              ))}
            </div>
          </Card>

          {/* Messaging activity */}
          <Card
            title="Messaging Activity"
            subtitle="Conversations and messages in the system"
            headerAction={<MessageSquare className="h-4 w-4 text-emerald-400" />}
          >
            {/* Mini stat row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Conversations</p>
                <p className="text-2xl font-black text-emerald-600">{messaging_activity.conversation_count}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Messages Sent</p>
                <p className="text-2xl font-black text-emerald-600">{messaging_activity.total_messages}</p>
              </div>
            </div>

            {/* Message type breakdown pills */}
            {messaging_activity.message_type_breakdown.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {messaging_activity.message_type_breakdown.map(t => (
                  <span
                    key={t.type}
                    className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
                  >
                    {t.type} · {t.count}
                  </span>
                ))}
              </div>
            )}

            {/* Daily volume mini bar chart */}
            {msgVolChart ? (
              <div style={{ height: 100 }}>
                <Bar
                  data={msgVolChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { bodyFont: { size: 11 } } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { font: { size: 9 }, stepSize: 1, precision: 0 },
                        grid: { color: C.grid },
                      },
                      x: { ticks: { font: { size: 9 } }, grid: { display: false } },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-16 text-xs text-slate-400">
                No messages in the last 30 days.
              </div>
            )}
          </Card>
        </div>

        {/* ── Footer note ── */}
        <p className="text-[11px] text-slate-400 text-center pb-2">
          Data source: <code className="font-mono text-slate-500">risk_reports</code> + <code className="font-mono text-slate-500">conversations</code> + <code className="font-mono text-slate-500">messages</code> · shared Neon database · score convention: 100 = safest
        </p>
      </div>
    </div>
  );
}
