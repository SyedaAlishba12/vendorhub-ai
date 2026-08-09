/**
 * app/analytics/page.tsx
 * Next.js App Router page for the Platform Analytics module.
 * Mounts the AnalyticsDashboard — no ToastProvider needed (no user-triggered actions).
 */

import type { Metadata } from 'next';
import AnalyticsDashboard from '@/pages/Analytics/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Platform Analytics — VendorHub AI',
  description: 'Risk score distributions, AI usage rates, fraud flag trends, and messaging activity across the VendorHub AI platform.',
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
