/**
 * components/Analytics/api.ts
 * Typed API call for GET /api/risk/analytics.
 * Mirrors the exact JSON shape returned by get_risk_analytics() in riskController.py.
 */

import apiClient from '@/utils/api/apiClient';

// ── Response types ────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  total_reports: number;
  distinct_vendors: number;
  avg_overall_score: number;
  avg_financial_score: number;
  avg_delivery_score: number;
}

export interface ScoreBucket {
  bucket: string;   // '0-19' | '20-39' | '40-59' | '60-79' | '80-100'
  count: number;
}

export interface ScoreTrendPoint {
  date: string;        // 'YYYY-MM-DD'
  avg_score: number;
  report_count: number;
}

export interface FraudFlag {
  flag: string;
  count: number;
}

export interface AiUsage {
  total_reports: number;
  ai_generated: number;
  rule_based: number;
  ai_generated_pct: number;
}

export interface CertStatusItem {
  status: string;
  count: number;
}

export interface MessageVolumePoint {
  date: string;
  count: number;
}

export interface MessageTypeItem {
  type: string;
  count: number;
}

export interface MessagingActivity {
  conversation_count: number;
  total_messages: number;
  message_volume_by_day: MessageVolumePoint[];
  message_type_breakdown: MessageTypeItem[];
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  score_distribution: ScoreBucket[];
  score_trend: ScoreTrendPoint[];
  fraud_flag_frequency: FraudFlag[];
  ai_usage: AiUsage;
  cert_status_breakdown: CertStatusItem[];
  messaging_activity: MessagingActivity;
}

// ── API call ──────────────────────────────────────────────────────────────────

export async function getRiskAnalytics(trendDays = 30): Promise<AnalyticsData> {
  const res = await apiClient.get<{ success: boolean; data: AnalyticsData }>(
    '/risk/analytics',
    { params: { trend_days: trendDays } }
  );
  return res.data.data;
}
