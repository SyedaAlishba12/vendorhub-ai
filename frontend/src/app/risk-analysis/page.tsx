/**
 * app/risk-analysis/page.tsx
 * Next.js App Router page for the Risk Analysis module.
 * Mounts the RiskAnalysisDashboard with the ToastProvider.
 */

import type { Metadata } from 'next';
import RiskAnalysisDashboard from '@/pages/RiskAnalysis/RiskAnalysisDashboard';
import { ToastProvider } from '@/components/SharedAnimations';

export const metadata: Metadata = {
  title: 'AI Risk Analysis — VendorHub AI',
  description: 'AI-powered vendor risk scoring, fraud detection, and procurement recommendations.',
};

export default function RiskAnalysisPage() {
  return (
    <ToastProvider>
      <RiskAnalysisDashboard />
    </ToastProvider>
  );
}
