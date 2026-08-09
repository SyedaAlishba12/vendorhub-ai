/**
 * components/Risk/types.ts
 * Shared TypeScript types for the Risk Analysis module.
 */

export type CertificationStatus = 'verified' | 'pending' | 'expired' | 'unverified';

export interface RiskReport {
  id: string;
  vendor_id: string;
  financial_risk_score: number;   // 0-100, HIGHER = SAFER
  delivery_risk_score: number;    // 0-100, HIGHER = SAFER
  overall_risk_score: number;     // 0-100, HIGHER = SAFER
  fraud_indicators: string[];
  certification_status: CertificationStatus;
  business_age_years: number | null;
  ai_recommendation: string;
  ai_used?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyzeVendorPayload {
  vendorId: string;
  certificationStatus?: CertificationStatus;
  businessAgeYears?: number;
  annualRevenueUsd?: number;
  onTimeDeliveryRate?: number;
  complaintRate?: number;
}

export interface RiskHistoryResponse {
  vendor_id: string;
  reports: RiskReport[];
  count: number;
  limit: number;
  offset: number;
}

export type RiskTier = 'low' | 'moderate' | 'high' | 'critical';

export function getRiskTier(score: number): RiskTier {
  if (score >= 80) return 'low';
  if (score >= 60) return 'moderate';
  if (score >= 40) return 'high';
  return 'critical';
}

export const RISK_TIER_CONFIG: Record<RiskTier, {
  label: string;
  color: string;
  bg: string;
  border: string;
  ring: string;
  text: string;
}> = {
  low:      { label: 'Low Risk',      color: '#10b981', bg: 'bg-emerald-50',  border: 'border-emerald-200', ring: 'ring-emerald-400', text: 'text-emerald-700' },
  moderate: { label: 'Moderate Risk', color: '#f59e0b', bg: 'bg-amber-50',    border: 'border-amber-200',   ring: 'ring-amber-400',   text: 'text-amber-700'   },
  high:     { label: 'High Risk',     color: '#f97316', bg: 'bg-orange-50',   border: 'border-orange-200',  ring: 'ring-orange-400',  text: 'text-orange-700'  },
  critical: { label: 'Critical Risk', color: '#ef4444', bg: 'bg-red-50',      border: 'border-red-200',     ring: 'ring-red-400',     text: 'text-red-700'     },
};
