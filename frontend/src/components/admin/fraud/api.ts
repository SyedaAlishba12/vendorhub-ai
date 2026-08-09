/**
 * components/admin/fraud/api.ts
 * Typed fetch helpers for all four GET /api/fraud/* endpoints.
 * Uses apiClient (axios, baseURL = NEXT_PUBLIC_API_BASE_URL) — no new deps.
 */

import apiClient from '@/utils/api/apiClient';

// ── Response types (mirror fraudController.py return shapes) ─────────────────

export interface FlaggedVendor {
  id: string;
  vendor_id: string;
  overall_risk_score: number;
  financial_risk_score: number;
  delivery_risk_score: number;
  fraud_indicators: string[];
  certification_status: string;
  business_age_years: number | null;
  ai_recommendation: string;
  ai_used: boolean;
  last_assessed_at: string;
  flag_reasons: string[];         // e.g. ['critical_score', 'bad_certification']
}

export interface FlaggedVendorSummary {
  total_flagged: number;          // distinct vendors (latest report per vendor)
  critical_score_count: number;
  multi_flag_count: number;
  bad_cert_count: number;
}

export interface FlaggedVendorsData {
  flagged_vendors: FlaggedVendor[];
  summary: FlaggedVendorSummary;
  thresholds: {
    score_threshold: number;
    multi_flag_min: number;
    bad_cert_statuses: string[];
  };
}

export interface DeterioratedVendor {
  vendor_id: string;
  latest_score: number;
  prior_score: number;
  score_drop: number;             // always positive
  latest_assessed_at: string;
  prior_assessed_at: string;
  latest_fraud_flags: string[];
  certification_status: string;
}

export interface DeteriorationData {
  deteriorated_vendors: DeterioratedVendor[];
  summary: {
    total_deteriorated: number;
    min_drop_threshold: number;   // 15 pts
    avg_drop: number;
  };
}

export interface TopSender {
  sender_id: string;
  total_messages: number;
  attachment_count: number;
  text_count: number;
  attachment_ratio: number;       // 0.0–1.0
}

export interface HighDeleteConversation {
  conversation_id: string;
  total_messages: number;
  deleted_messages: number;
  delete_ratio: number;           // 0.0–1.0
  last_message_at: string | null;
}

export interface MessagingAnomaliesData {
  top_senders: TopSender[];
  high_delete_conversations: HighDeleteConversation[];
  summary: {
    total_conversations: number;
    conversations_with_high_delete: number;
    delete_ratio_threshold: number;
    top_senders_limit: number;
  };
}

export interface FlagFrequencyData {
  fraud_flag_frequency: { flag: string; count: number }[];
  cert_status_breakdown: { status: string; count: number }[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getFlaggedVendors(): Promise<FlaggedVendorsData> {
  const res = await apiClient.get<{ success: boolean; data: FlaggedVendorsData }>(
    '/fraud/flagged-vendors',
  );
  return res.data.data;
}

export async function getDeteriorationData(): Promise<DeteriorationData> {
  const res = await apiClient.get<{ success: boolean; data: DeteriorationData }>(
    '/fraud/deterioration',
  );
  return res.data.data;
}

export async function getMessagingAnomalies(): Promise<MessagingAnomaliesData> {
  const res = await apiClient.get<{ success: boolean; data: MessagingAnomaliesData }>(
    '/fraud/messaging-anomalies',
  );
  return res.data.data;
}

export async function getFlagFrequency(): Promise<FlagFrequencyData> {
  const res = await apiClient.get<{ success: boolean; data: FlagFrequencyData }>(
    '/fraud/flag-frequency',
  );
  return res.data.data;
}
