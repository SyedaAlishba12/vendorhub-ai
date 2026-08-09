/**
 * components/Risk/api.ts
 * Axios calls for the Risk Analysis API endpoints.
 */

import apiClient from '@/utils/api/apiClient';
import { AnalyzeVendorPayload, RiskHistoryResponse, RiskReport } from './types';

/** POST /api/risk/analyze — run a new risk assessment */
export async function analyzeVendor(payload: AnalyzeVendorPayload): Promise<RiskReport> {
  const res = await apiClient.post<{ success: boolean; data: RiskReport }>('/risk/analyze', {
    vendorId: payload.vendorId,
    certificationStatus: payload.certificationStatus ?? 'unverified',
    businessAgeYears: payload.businessAgeYears,
    annualRevenueUsd: payload.annualRevenueUsd,
    onTimeDeliveryRate: payload.onTimeDeliveryRate,
    complaintRate: payload.complaintRate,
  });
  return res.data.data;
}

/** GET /api/risk/{vendorId} — most-recent report */
export async function getLatestReport(vendorId: string): Promise<RiskReport | null> {
  try {
    const res = await apiClient.get<{ success: boolean; data: RiskReport }>(`/risk/${vendorId}`);
    return res.data.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

/** GET /api/risk/history?vendorId= — full history */
export async function getReportHistory(
  vendorId: string,
  limit = 20,
  offset = 0
): Promise<RiskHistoryResponse> {
  const res = await apiClient.get<{ success: boolean; data: RiskHistoryResponse }>(
    `/risk/history`,
    { params: { vendorId, limit, offset } }
  );
  return res.data.data;
}
