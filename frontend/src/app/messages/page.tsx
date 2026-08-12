'use client';

/**
 * app/messages/page.tsx
 *
 * Next.js App Router page for the AI Assistant & Chat module.
 *
 * Pattern: self-contained 'use client' page (matches app/orders/page.tsx).
 * No intermediate pages/Messages/MessagesPage.tsx exists yet — that
 * placeholder will be filled when the full messaging UI is built. For now
 * this page owns the layout directly, which is the same approach orders uses.
 *
 * Layout:
 *   Toolbar (page header + "✨ AI Negotiation Copilot" trigger button)
 *   Conversation list placeholder  ← future full messaging UI slots in here
 *   NegotiationCopilotPanel        ← slide-in drawer, mounted here at page level
 *
 * The panel integration:
 *   1. Trigger button in the toolbar opens the panel (setPanelOpen(true)).
 *   2. Panel receives controlled props (vendorName, item, prices, etc.)
 *      from the form state managed on this page.
 *   3. onSuggestionGenerated injects the draft into `composeValue` state,
 *      which will wire into the message compose input when the full chat
 *      UI is built. A toast notification confirms the injection.
 *   4. Sending is through the existing POST /api/messages path — the
 *      generated text is a plain text MessageType.text message.
 */

import React, { useState } from 'react';
import { Sparkles, MessageSquare, Info } from 'lucide-react';
import apiClient from '@/utils/api/apiClient';
import NegotiationCopilotPanel from '@/components/Negotiation/NegotiationCopilotPanel';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MessagesPage() {
  // ── Negotiation panel state ─────────────────────────────────────────────
  const [panelOpen, setPanelOpen]       = useState(false);
  const [composeValue, setComposeValue] = useState('');
  const [draftInjected, setDraftInjected] = useState(false);

  // ── Send state ──────────────────────────────────────────────────────────
  const [sending, setSending]   = useState(false);
  const [sendError, setSendError] = useState('');
  const [sentOk, setSentOk]     = useState(false);

  // Panel props — seeded with a realistic scenario so the Copilot can
  // generate a real draft even before the full chat UI wires live data.
  // When the messaging UI is built, these will come from the active conversation.
  const [panelProps] = useState({
    vendorName:      'Acme Steel Supplies Ltd.',
    itemDescription: 'Grade-A Hot-Rolled Steel Coil, 5mm thickness, 500 MT',
    quotedPrice:     14.50,
    targetPrice:     12.00,
    currency:        'USD $',
    notes:           'We have a competing quote at USD $11.80. Long-term contract possible.',
  });

  const handleSuggestionGenerated = (draft: string) => {
    setComposeValue(draft);
    setDraftInjected(true);
    setSentOk(false);
    setSendError('');
    // Auto-clear the confirmation banner after 4 s
    setTimeout(() => setDraftInjected(false), 4000);
  };

  // ── Send handler — POST /api/messages ───────────────────────────────────
  const handleSend = async () => {
    if (!composeValue.trim() || sending) return;
    setSending(true);
    setSendError('');
    setSentOk(false);
    try {
      // TODO(messaging-ui): replace this hardcoded conversation_id with the
      // ID of the conversation the buyer has selected in the chat list.
      // This is a temporary constant used until real conversation selection
      // exists in the UI — it targets the seeded conversation in the DB.
      const TEMP_CONVERSATION_ID = '124ac567-a6a1-4e80-a4dc-6a3e15cccd4a';

      await apiClient.post<{ success: boolean; data: unknown }>(
        '/messages',
        { conversationId: TEMP_CONVERSATION_ID, content: composeValue.trim() },
      );

      setComposeValue('');
      setSentOk(true);
      setTimeout(() => setSentOk(false), 4000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string };
      setSendError(
        axiosErr?.response?.data?.detail ??
        axiosErr?.message ??
        'Failed to send message. Please try again.',
      );
    } finally {
      setSending(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page header + toolbar ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            AI Assistant &amp; Chat
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Message vendors directly. Use the AI Negotiation Copilot to draft
            counter-offers without leaving the conversation.
          </p>
        </div>

        {/* Trigger button — opens NegotiationCopilotPanel */}
        <button
          id="nego-open-panel-btn"
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700
            text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Negotiation Copilot
        </button>
      </div>

      {/* ── Draft-injected confirmation banner ── */}
      {draftInjected && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl
          bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span>Draft injected into the compose box — edit and send when ready.</span>
          </div>
          <button
            onClick={() => setDraftInjected(false)}
            className="text-indigo-400 hover:text-indigo-700 font-bold text-sm leading-none transition-colors"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Compose box (placeholder — wires to real send flow) ── */}
      {composeValue && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Compose
            </p>
            <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
              AI Draft
            </span>
          </div>
          <textarea
            id="messages-compose-input"
            value={composeValue}
            onChange={(e) => setComposeValue(e.target.value)}
            rows={8}
            placeholder="Your message…"
            className="w-full px-4 py-3 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200
              rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50
              transition-all resize-y leading-relaxed"
          />
          {/* Send error banner */}
          {sendError && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <span className="shrink-0">⚠</span>
              <span>{sendError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2.5">
            <button
              onClick={() => { setComposeValue(''); setSendError(''); }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600
                hover:bg-slate-50 transition-all"
            >
              Clear
            </button>
            <button
              id="messages-send-btn"
              onClick={handleSend}
              disabled={!composeValue.trim() || sending}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold
                shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </div>
        </div>
      )}

      {/* ── Message sent confirmation banner ── */}
      {sentOk && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl
          bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Message sent successfully to conversation <code className="font-mono">124ac567…</code></span>
          </div>
          <button
            onClick={() => setSentOk(false)}
            className="text-emerald-400 hover:text-emerald-700 font-bold text-sm leading-none transition-colors"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Conversation list placeholder ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Conversations</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Full UI coming
          </span>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
            <MessageSquare className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-sm font-bold text-slate-900 mb-1">No conversations yet</p>
          <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
            Conversations with vendors will appear here. Use the{' '}
            <span className="font-bold text-indigo-600">AI Negotiation Copilot</span> button
            above to draft a counter-offer for any active quote.
          </p>
        </div>
      </div>

      {/* ── Info callout — explains the AI Copilot integration ── */}
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-700">About AI Negotiation Copilot</p>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            Fills in vendor name, item, and prices → calls{' '}
            <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">
              POST /api/negotiation/suggest
            </code>{' '}
            → returns a ready-to-edit counter-offer draft. The draft is sent as
            a plain text message — no new message type, no database schema changes.
            Powered by Gemini 2.0 Flash with a rule-based fallback.
          </p>
        </div>
      </div>

      {/* ── NegotiationCopilotPanel — mounted at page level ── */}
      <NegotiationCopilotPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        vendorName={panelProps.vendorName}
        itemDescription={panelProps.itemDescription}
        quotedPrice={panelProps.quotedPrice}
        targetPrice={panelProps.targetPrice}
        currency={panelProps.currency}
        notes={panelProps.notes}
        onSuggestionGenerated={handleSuggestionGenerated}
      />

    </div>
  );
}
