'use client';
/**
 * pages/RiskAnalysis/RiskAnalysisDashboard.tsx
 *
 * Main Risk Analysis dashboard page.
 * Mounted at the Next.js app route: /risk-analysis
 *
 * Sections:
 *  1. Analyze form     — enter vendor ID + optional attributes → POST /api/risk/analyze
 *  2. Score overview   — gauge + individual bars
 *  3. AI recommendation card
 *  4. Fraud indicators list
 *  5. Score trend chart (from history)
 *  6. History table   — clickable rows to inspect past reports
 *  7. Download button — calls POST /api/pdf/generate (graceful "coming soon" state)
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ShieldCheck, ShieldAlert, RefreshCw, Download,
  Sparkles, Clock, DollarSign, Truck, ChevronRight,
  Bot, AlertCircle,
} from 'lucide-react';

import { Button }         from '@/components/UI/Button';
import { Card }           from '@/components/UI/Card';
import { LoadingSpinner, SkeletonLoader, useToast } from '@/components/SharedAnimations';

import { RiskScoreGauge }    from '@/components/Risk/RiskScoreGauge';
import { RiskScoreBar }      from '@/components/Risk/RiskScoreBar';
import { FraudIndicatorList } from '@/components/Risk/FraudIndicatorList';
import { RiskHistoryTable }  from '@/components/Risk/RiskHistoryTable';
import { RiskTrendChart }    from '@/components/Risk/RiskTrendChart';
import {
  analyzeVendor, getLatestReport, getReportHistory,
} from '@/components/Risk/api';
import {
  RiskReport, AnalyzeVendorPayload, CertificationStatus, RISK_TIER_CONFIG, getRiskTier,
} from '@/components/Risk/types';

// Demo vendor ID pre-filled for easy testing (matches the e2e test vendor)
const DEMO_VENDOR_ID = '00000000-0000-0000-0000-000000000099';

// ---------------------------------------------------------------------------
// Sub-component: Certification badge
// ---------------------------------------------------------------------------
function CertBadge({ status }: { status: CertificationStatus }) {
  const map: Record<CertificationStatus, { label: string; cls: string }> = {
    verified:   { label: 'Verified',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    pending:    { label: 'Pending',    cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    expired:    { label: 'Expired',    cls: 'bg-orange-50 text-orange-700 border-orange-200' },
    unverified: { label: 'Unverified', cls: 'bg-slate-50 text-slate-500 border-slate-200' },
  };
  const { label, cls } = map[status] ?? map.unverified;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border ${cls}`}>
      <ShieldCheck className="h-3 w-3" /> {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function RiskAnalysisDashboard() {
  const { showToast } = useToast();

  // ── Form state
  const [vendorId, setVendorId]           = useState(DEMO_VENDOR_ID);
  const [certStatus, setCertStatus]       = useState<CertificationStatus>('unverified');
  const [businessAge, setBusinessAge]     = useState('');
  const [revenue, setRevenue]             = useState('');
  const [deliveryRate, setDeliveryRate]   = useState('');
  const [complaintRate, setComplaintRate] = useState('');

  // ── Data state
  const [report, setReport]           = useState<RiskReport | null>(null);
  const [history, setHistory]         = useState<RiskReport[]>([]);
  const [selectedReport, setSelected] = useState<RiskReport | null>(null);

  // ── Loading states
  const [analyzing, setAnalyzing]   = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [pdfState, setPdfState]     = useState<'idle' | 'loading' | 'unavailable'>('idle');

  // ── On mount: load latest report + history for the demo vendor
  useEffect(() => {
    async function init() {
      try {
        const [latest, hist] = await Promise.all([
          getLatestReport(DEMO_VENDOR_ID),
          getReportHistory(DEMO_VENDOR_ID, 20, 0),
        ]);
        if (latest) {
          setReport(latest);
          setSelected(latest);
        }
        setHistory(hist.reports);
      } catch {
        // No data yet — that's fine, user will run first analysis
      } finally {
        setLoadingInit(false);
      }
    }
    init();
  }, []);

  // ── Run analysis
  const handleAnalyze = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId.trim()) return;

    setAnalyzing(true);
    try {
      const payload: AnalyzeVendorPayload = {
        vendorId: vendorId.trim(),
        certificationStatus: certStatus,
        businessAgeYears: businessAge ? parseInt(businessAge, 10) : undefined,
        annualRevenueUsd: revenue ? parseFloat(revenue) : undefined,
        onTimeDeliveryRate: deliveryRate ? parseFloat(deliveryRate) : undefined,
        complaintRate: complaintRate ? parseFloat(complaintRate) : undefined,
      };
      const newReport = await analyzeVendor(payload);
      setReport(newReport);
      setSelected(newReport);

      // Refresh history
      const hist = await getReportHistory(vendorId.trim(), 20, 0);
      setHistory(hist.reports);

      showToast(`Risk analysis complete — overall score: ${newReport.overall_risk_score}/100`, 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Analysis failed.';
      showToast(msg, 'error');
    } finally {
      setAnalyzing(false);
    }
  }, [vendorId, certStatus, businessAge, revenue, deliveryRate, complaintRate, showToast]);

  // ── Download PDF
  const handleDownload = useCallback(async () => {
    if (!report) return;
    setPdfState('loading');
    try {
      const res = await fetch('http://localhost:8000/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id, type: 'risk_report' }),
      });
      if (res.status === 404 || res.status === 405) {
        setPdfState('unavailable');
        showToast('PDF service is not yet available — coming soon!', 'info');
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `risk-report-${report.vendor_id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setPdfState('idle');
      showToast('PDF downloaded!', 'success');
    } catch {
      setPdfState('unavailable');
      showToast('Report generation coming soon — PDF service not yet deployed.', 'info');
    }
  }, [report, showToast]);

  // ── Displayed report (either selected history row or latest)
  const displayed = selectedReport ?? report;
  const tier = displayed ? getRiskTier(displayed.overall_risk_score) : null;
  const tierConfig = tier ? RISK_TIER_CONFIG[tier] : null;

  // ── Skeleton for initial load
  if (loadingInit) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 space-y-4">
        <SkeletonLoader className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SkeletonLoader className="h-64 rounded-2xl" />
          <SkeletonLoader className="h-64 rounded-2xl" />
          <SkeletonLoader className="h-64 rounded-2xl" />
        </div>
        <SkeletonLoader className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-200">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900">
                AI Risk Analysis
                <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full uppercase tracking-wider">
                  Module 13
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Real-time AI-powered vendor risk scoring &amp; recommendations
              </p>
            </div>
          </div>
          {displayed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              isLoading={pdfState === 'loading'}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              {pdfState === 'unavailable' ? 'PDF Coming Soon' : 'Download Report'}
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Analyze Form ── */}
        <Card
          title="Vendor Risk Assessment"
          subtitle="Enter vendor details to generate an AI-powered risk report"
          badge="AI"
          headerAction={
            <div className="flex items-center gap-1 text-[10px] text-violet-600 font-bold bg-violet-50 px-2 py-1 rounded-full border border-violet-100">
              <Sparkles className="h-3 w-3" /> Gemini AI
            </div>
          }
        >
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Vendor ID */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Vendor ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  required
                />
              </div>

              {/* Certification Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Certification Status
                </label>
                <select
                  value={certStatus}
                  onChange={(e) => setCertStatus(e.target.value as CertificationStatus)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              {/* Business Age */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Business Age (years)
                </label>
                <input
                  type="number"
                  value={businessAge}
                  onChange={(e) => setBusinessAge(e.target.value)}
                  placeholder="e.g. 5"
                  min="0"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                />
              </div>

              {/* Annual Revenue */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Annual Revenue (USD)
                </label>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="e.g. 500000"
                  min="0"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                />
              </div>

              {/* On-time Delivery Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  On-time Delivery Rate (0–1)
                </label>
                <input
                  type="number"
                  value={deliveryRate}
                  onChange={(e) => setDeliveryRate(e.target.value)}
                  placeholder="e.g. 0.92"
                  min="0" max="1" step="0.01"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                />
              </div>

              {/* Complaint Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Complaint Rate (0–1)
                </label>
                <input
                  type="number"
                  value={complaintRate}
                  onChange={(e) => setComplaintRate(e.target.value)}
                  placeholder="e.g. 0.05"
                  min="0" max="1" step="0.01"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                variant="ai"
                size="md"
                isLoading={analyzing}
                className="gap-2"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {analyzing ? 'Analyzing…' : 'Run AI Risk Analysis'}
              </Button>
              {displayed && (
                <p className="text-xs text-slate-400">
                  Last analyzed: {new Date(displayed.created_at).toLocaleString()}
                </p>
              )}
            </div>
          </form>
        </Card>

        {/* ── Results section — only if we have a report ── */}
        {displayed ? (
          <>
            {/* ── Row 1: Gauge + Score Bars + AI Recommendation ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Overall score gauge */}
              <Card className="flex flex-col items-center justify-center py-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Overall Risk Score
                </p>
                <RiskScoreGauge score={displayed.overall_risk_score} size={180} />
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <CertBadge status={displayed.certification_status as CertificationStatus} />
                  {displayed.business_age_years != null && (
                    <span className="text-slate-400">{displayed.business_age_years}yr in business</span>
                  )}
                </div>
              </Card>

              {/* Individual score bars */}
              <Card title="Score Breakdown" subtitle="Higher = safer (0–100)">
                <div className="space-y-5 pt-1">
                  <RiskScoreBar
                    label="Financial Risk"
                    score={displayed.financial_risk_score}
                    icon={<DollarSign className="h-3.5 w-3.5" />}
                  />
                  <RiskScoreBar
                    label="Delivery Risk"
                    score={displayed.delivery_risk_score}
                    icon={<Truck className="h-3.5 w-3.5" />}
                  />
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
                  <p>Weights: Financial 50% · Delivery 50%</p>
                  <p>Score convention: 100 = safest, 0 = highest risk</p>
                </div>
              </Card>

              {/* AI Recommendation */}
              <Card
                title="AI Recommendation"
                badge={(displayed as any).ai_used === false ? 'Rule-based' : 'Gemini AI'}
                headerAction={<Bot className="h-4 w-4 text-violet-400" />}
              >
                <div className={`rounded-xl p-4 border text-sm leading-relaxed font-medium ${tierConfig?.bg} ${tierConfig?.border} ${tierConfig?.text}`}>
                  {displayed.ai_recommendation || 'No recommendation available.'}
                </div>
              </Card>
            </div>

            {/* ── Row 2: Fraud Indicators + Trend Chart ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                title="Fraud Indicators"
                subtitle={
                  displayed.fraud_indicators.length
                    ? `${displayed.fraud_indicators.length} flag${displayed.fraud_indicators.length > 1 ? 's' : ''} detected`
                    : 'No flags detected'
                }
              >
                <FraudIndicatorList indicators={displayed.fraud_indicators} />
              </Card>

              <Card title="Score Trend" subtitle="All risk reports over time" badge="History">
                <RiskTrendChart reports={history} />
              </Card>
            </div>

            {/* ── Row 3: History Table ── */}
            <Card
              title="Report History"
              subtitle={`${history.length} report${history.length !== 1 ? 's' : ''} — click a row to inspect`}
              headerAction={
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="h-3 w-3" /> newest first
                </div>
              }
            >
              <RiskHistoryTable
                reports={history}
                onSelect={setSelected}
                selectedId={selectedReport?.id}
              />
            </Card>
          </>
        ) : (
          /* ── Empty state ── */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-4">
              <ShieldCheck className="h-8 w-8 text-indigo-300" />
            </div>
            <h2 className="text-base font-bold text-slate-700 mb-2">No reports yet</h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Fill in the vendor details above and click <strong>Run AI Risk Analysis</strong> to generate your first report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
