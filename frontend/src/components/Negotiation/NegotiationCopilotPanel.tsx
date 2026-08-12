'use client';

/**
 * components/Negotiation/NegotiationCopilotPanel.tsx
 *
 * Slide-in drawer panel for the AI Negotiation Copilot.
 *
 * Structure follows Modal.tsx exactly:
 *   - `if (!isOpen) return null` early exit
 *   - Single root div[role="dialog" aria-modal="true"] at z-[9000]
 *   - Backdrop div[aria-hidden onClick=onClose absolute inset-0 bg-slate-900/60 backdrop-blur-sm]
 *   - Panel div[relative z-10 bg-white ...] — adapted to a right-anchored drawer
 *   - Escape key + body-scroll lock via useCallback/useEffect (same as Modal.tsx)
 *   - Inline <style> keyframes at the bottom of the return (same as Modal.tsx)
 *
 * API convention follows components/Risk/api.ts and components/admin/fraud/api.ts:
 *   - import apiClient from '@/utils/api/apiClient'
 *   - apiClient.post<{ success: boolean; data: T }>(path, body)
 *   - unwrap via res.data.data
 *
 * Props (all controlled by the parent — panel is a pure presentational wrapper):
 *   isOpen               — show/hide
 *   onClose              — called on Escape, backdrop click, or X button
 *   vendorName           — pre-filled; editable inside the panel
 *   itemDescription      — pre-filled; editable inside the panel
 *   quotedPrice          — vendor's quoted price (number)
 *   targetPrice          — buyer's target price (number)
 *   currency             — display currency string, e.g. "USD $"
 *   notes                — optional free-text context
 *   onSuggestionGenerated — called with the draft string once the API responds;
 *                           parent is responsible for injecting it into the
 *                           compose box — no new message type, no DB writes
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import apiClient from '@/utils/api/apiClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NegotiationCopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  itemDescription: string;
  quotedPrice: number;
  targetPrice: number;
  currency?: string;
  notes?: string;
  /** Receives the generated draft text; parent injects it into the chat compose input. */
  onSuggestionGenerated: (draft: string) => void;
}

interface SuggestPayload {
  vendor_name: string;
  item_description: string;
  quoted_price: number;
  target_price: number;
  currency: string;
  notes: string | null;
}

interface SuggestResponseData {
  draft: string;
  ai_used: boolean;
  context: {
    vendor_name: string;
    item_description: string;
    quoted_price: number;
    target_price: number;
    currency: string;
    gap: number;
    gap_pct: number;
    notes: string;
  };
}

// ---------------------------------------------------------------------------
// API call — matches apiClient convention in Risk/api.ts and fraud/api.ts
// ---------------------------------------------------------------------------

async function postNegotiationSuggest(payload: SuggestPayload): Promise<SuggestResponseData> {
  const res = await apiClient.post<{ success: boolean; data: SuggestResponseData }>(
    '/negotiation/suggest',
    payload,
  );
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const NegotiationCopilotPanel: React.FC<NegotiationCopilotPanelProps> = ({
  isOpen,
  onClose,
  vendorName,
  itemDescription,
  quotedPrice,
  targetPrice,
  currency = 'USD $',
  notes = '',
  onSuggestionGenerated,
}) => {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [aiUsed, setAiUsed] = useState<boolean | null>(null);
  const [gapInfo, setGapInfo] = useState<{ gap: number; gap_pct: number } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // ── Reset internal state when panel closes ──────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setDraft('');
      setAiUsed(null);
      setGapInfo(null);
      setError('');
      setCopied(false);
      setLoading(false);
    }
  }, [isOpen]);

  // ── Escape key + body scroll lock — identical to Modal.tsx ──────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // ── Early exit — same as Modal.tsx ──────────────────────────────────────
  if (!isOpen) return null;

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setError('');
    setDraft('');
    setAiUsed(null);
    setGapInfo(null);

    // Client-side guard — catches the default zero-price state before hitting the API
    if (!vendorName.trim()) { setError('Vendor name is required.'); return; }
    if (!itemDescription.trim()) { setError('Item description is required.'); return; }
    if (quotedPrice <= 0) { setError('Quoted price must be greater than 0.'); return; }
    if (targetPrice <= 0) { setError('Target price must be greater than 0.'); return; }
    if (targetPrice >= quotedPrice) {
      setError('Target price must be lower than the quoted price.');
      return;
    }

    setLoading(true);
    try {
      const data = await postNegotiationSuggest({
        vendor_name: vendorName,
        item_description: itemDescription,
        quoted_price: quotedPrice,
        target_price: targetPrice,
        currency: currency || 'USD $',
        notes: notes?.trim() || null,
      });
      setDraft(data.draft);
      setAiUsed(data.ai_used);
      setGapInfo({ gap: data.context.gap, gap_pct: data.context.gap_pct });
    } catch (err: unknown) {
      // Axios wraps HTTP errors. FastAPI Pydantic validation errors return
      // detail as an array of objects [{type, loc, msg, ...}] — never render
      // that array directly as a React child; always coerce to a string.
      const axiosErr = err as { response?: { data?: { detail?: unknown } }; message?: string };
      const rawDetail = axiosErr?.response?.data?.detail;
      let msg: string;
      if (typeof rawDetail === 'string') {
        msg = rawDetail;
      } else if (Array.isArray(rawDetail) && rawDetail.length > 0) {
        // Pydantic v2 validation error array: pick the first human-readable message
        const first = rawDetail[0] as { msg?: string; loc?: string[] };
        const field = first.loc ? first.loc[first.loc.length - 1] : '';
        msg = field ? `${field}: ${first.msg ?? 'invalid value'}` : (first.msg ?? 'Validation error');
      } else {
        msg = axiosErr?.message ?? 'Failed to generate draft. Please try again.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleUseDraft = () => {
    if (!draft) return;
    onSuggestionGenerated(draft);
    onClose();
  };

  // Derived: live gap display from props (before any API call)
  const propsGap = quotedPrice > 0 && targetPrice > 0 && targetPrice < quotedPrice
    ? {
        gap: (quotedPrice - targetPrice).toFixed(2),
        pct: ((quotedPrice - targetPrice) / quotedPrice * 100).toFixed(1),
      }
    : null;

  // ── Render ───────────────────────────────────────────────────────────────
  //
  // Root structure mirrors Modal.tsx exactly:
  //   div[role=dialog] → backdrop div[aria-hidden] → panel div[relative z-10]
  //
  // The only structural divergence from Modal.tsx is the panel position:
  // instead of centered (flex items-center justify-center), the panel is
  // right-anchored (fixed top-0 right-0 h-full) to behave as a drawer.
  // The backdrop, z-index, Escape/scroll-lock, and keyframe injection are
  // all identical to Modal.tsx.
  //
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Negotiation Copilot"
      className="fixed inset-0 z-[9000]"
      style={{ animation: 'modalFadeIn 0.15s ease-out' }}
    >
      {/* Backdrop — identical to Modal.tsx */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Panel — right-anchored drawer */}
      <div
        className="relative z-10 ml-auto h-full w-full max-w-[460px] bg-white shadow-2xl border-l border-slate-200 flex flex-col"
        style={{ animation: 'modalSlideIn 0.15s ease-out' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Sparkle icon — real Lucide component (lucide-react already installed) */}
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100">
              <Sparkles className="h-4 w-4 text-indigo-600" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Negotiation Copilot</h2>
              <p className="text-[10px] text-slate-500 font-medium">Gemini 2.0 Flash · rule-based fallback</p>
            </div>
          </div>
          {/* Close button — identical className to Modal.tsx */}
          <button
            id="nego-panel-close"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body — px-5 py-5 text-sm text-slate-700 matches Modal.tsx body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 text-sm text-slate-700 leading-relaxed space-y-4">

          {/* Context summary card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 space-y-1.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Negotiation Context</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Vendor</span>
                <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate">{vendorName || '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Item</span>
                <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate">{itemDescription || '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Quoted</span>
                <span className="font-semibold text-slate-800">{currency}{quotedPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Your target</span>
                <span className="font-bold text-indigo-700">{currency}{targetPrice.toFixed(2)}</span>
              </div>
              {propsGap && (
                <div className="flex justify-between text-xs pt-0.5 border-t border-slate-200 mt-1">
                  <span className="text-slate-500 font-medium">Gap</span>
                  <span className="font-black text-slate-900">
                    {currency}{propsGap.gap} <span className="text-slate-400 font-semibold">({propsGap.pct}% reduction)</span>
                  </span>
                </div>
              )}
              {notes?.trim() && (
                <div className="pt-1.5 border-t border-slate-200 mt-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Notes</p>
                  <p className="text-xs text-slate-600 font-medium leading-snug">{notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-rose-50 border border-rose-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-xs font-semibold text-rose-700 leading-snug">{error}</p>
            </div>
          )}

          {/* Draft output */}
          {draft && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generated Draft</p>
                  {aiUsed !== null && (
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border ${
                      aiUsed
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {aiUsed ? 'Gemini AI' : 'Rule-based'}
                    </span>
                  )}
                </div>
                {gapInfo && (
                  <span className="text-[10px] font-bold text-slate-400">
                    {gapInfo.gap_pct}% · {currency}{gapInfo.gap.toFixed(2)} gap
                  </span>
                )}
              </div>

              <div className="relative">
                <textarea
                  id="nego-draft-output"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none
                    focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all resize-y leading-relaxed"
                />
                {/* Copy button */}
                <button
                  id="nego-copy-btn"
                  onClick={handleCopy}
                  title={copied ? 'Copied!' : 'Copy to clipboard'}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 shadow-sm transition-all"
                >
                  {copied ? (
                    // Check icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    // Copy icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 font-medium text-center">
                Edit freely above — it becomes a plain chat message when sent.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-slate-100 px-5 pt-4 pb-5 shrink-0 space-y-2.5">
          {draft ? (
            <div className="flex gap-2.5">
              {/* Regenerate */}
              <button
                id="nego-regenerate-btn"
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700
                  hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Refresh icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.636 15.364A9 9 0 1018.364 8.636" />
                </svg>
                Regenerate
              </button>
              {/* Use this draft */}
              <button
                id="nego-use-draft-btn"
                onClick={handleUseDraft}
                disabled={loading || !draft}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700
                  text-white text-xs font-bold shadow-sm transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* ChevronRight icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                Use This Draft
              </button>
            </div>
          ) : (
            <button
              id="nego-generate-btn"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700
                text-white text-xs font-bold shadow-sm transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  {/* Spinner */}
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Generating draft…
                </>
              ) : (
                <>
                  {/* Sparkles icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3z" />
                  </svg>
                  Generate Counter-Offer Draft
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Keyframe styles — injected inline, same as Modal.tsx */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default NegotiationCopilotPanel;
