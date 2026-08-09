'use client';
/**
 * components/admin/fraud/MessagingAnomaliesPanel.tsx
 *
 * Two sub-sections derived from messages + conversations tables only:
 *
 * (a) Top Senders — ranked by total non-deleted message count.
 *     "Total messages" here means non-deleted messages sent by this sender
 *     across ALL conversations on the platform.
 *
 * (b) High Soft-Delete Ratio Conversations — conversations where ≥25% of
 *     all messages (including deleted) have been soft-deleted.
 *
 * Counting units are labelled explicitly in each section header.
 */

import React, { useState } from 'react';
import { MessageSquare, Trash2, Users, AlertTriangle } from 'lucide-react';
import type { MessagingAnomaliesData } from './api';

interface Props {
  data: MessagingAnomaliesData;
}

function deleteRatioColour(ratio: number): string {
  if (ratio >= 0.6) return 'text-red-600';
  if (ratio >= 0.4) return 'text-orange-600';
  return 'text-amber-600';
}

function deleteRatioBg(ratio: number): string {
  if (ratio >= 0.6) return 'bg-red-50 border-red-200';
  if (ratio >= 0.4) return 'bg-orange-50 border-orange-200';
  return 'bg-amber-50 border-amber-200';
}

export function MessagingAnomaliesPanel({ data }: Props) {
  const [activeTab, setActiveTab] = useState<'senders' | 'delete'>('senders');
  const { top_senders, high_delete_conversations, summary } = data;

  const tabCls = (t: typeof activeTab) =>
    `pb-2.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
      activeTab === t
        ? 'border-indigo-600 text-indigo-600'
        : 'border-transparent text-slate-400 hover:text-slate-600'
    }`;

  return (
    <div>
      {/* Summary context line */}
      <p className="text-[10px] text-slate-400 mb-3 font-medium">
        Platform total: <strong className="text-slate-600">{summary.total_conversations}</strong> conversation{summary.total_conversations !== 1 ? 's' : ''} ·{' '}
        <strong className="text-amber-600">{summary.conversations_with_high_delete}</strong> exceed {Math.round(summary.delete_ratio_threshold * 100)}% delete threshold
      </p>

      {/* Tab bar */}
      <div className="flex gap-5 border-b border-slate-100 mb-4">
        <button className={tabCls('senders')} onClick={() => setActiveTab('senders')}>
          <Users size={13} /> Top Senders by Volume
        </button>
        <button className={tabCls('delete')} onClick={() => setActiveTab('delete')}>
          <Trash2 size={13} /> High Delete-Ratio Conversations
          {summary.conversations_with_high_delete > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 text-[9px] font-black rounded-full bg-red-100 text-red-700">
              {summary.conversations_with_high_delete}
            </span>
          )}
        </button>
      </div>

      {/* ── Tab: Top Senders ─────────────────────────────────────────────── */}
      {activeTab === 'senders' && (
        <div>
          <p className="text-[10px] text-slate-400 mb-2 font-medium">
            Counts <strong>non-deleted messages</strong> per sender across all conversations
          </p>
          {top_senders.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-slate-400 text-xs gap-2">
              <MessageSquare size={18} className="text-slate-300" />
              No message data available yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Sender ID</th>
                  <th className="p-3">Total Messages</th>
                  <th className="p-3">Text</th>
                  <th className="p-3">Attachments</th>
                  <th className="p-3">Attachment Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top_senders.map((s, idx) => (
                  <tr key={s.sender_id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-black text-slate-400 text-[11px]">
                      #{idx + 1}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">
                      {s.sender_id.slice(0, 8)}…
                    </td>
                    <td className="p-3 font-bold text-slate-700">{s.total_messages}</td>
                    <td className="p-3 text-slate-500">{s.text_count}</td>
                    <td className="p-3 text-slate-500">{s.attachment_count}</td>
                    <td className="p-3">
                      {s.total_messages > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-indigo-400 h-1.5 rounded-full"
                              style={{ width: `${Math.round(s.attachment_ratio * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {Math.round(s.attachment_ratio * 100)}%
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Tab: High Delete-Ratio Conversations ─────────────────────────── */}
      {activeTab === 'delete' && (
        <div>
          <p className="text-[10px] text-slate-400 mb-2 font-medium">
            Conversations where ≥{Math.round(summary.delete_ratio_threshold * 100)}% of <strong>all messages</strong> (including deleted) have been soft-deleted
          </p>
          {high_delete_conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-xs gap-2">
              <Trash2 size={20} className="text-slate-300" />
              <p>No conversations exceed the delete-ratio threshold.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Conversation ID</th>
                  <th className="p-3">Total Messages</th>
                  <th className="p-3">Deleted</th>
                  <th className="p-3">Delete Ratio</th>
                  <th className="p-3">Last Activity</th>
                  <th className="p-3">Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {high_delete_conversations.map((c) => (
                  <tr key={c.conversation_id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono text-[10px] text-slate-400">
                      {c.conversation_id.slice(0, 8)}…
                    </td>
                    <td className="p-3 font-semibold">{c.total_messages}</td>
                    <td className="p-3 text-red-500 font-semibold">{c.deleted_messages}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${deleteRatioBg(c.delete_ratio)} ${deleteRatioColour(c.delete_ratio)}`}>
                        {Math.round(c.delete_ratio * 100)}%
                      </span>
                    </td>
                    <td className="p-3 text-[10px] text-slate-400 whitespace-nowrap">
                      {c.last_message_at
                        ? new Date(c.last_message_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                        <AlertTriangle size={9} /> Possible evidence scrubbing
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
