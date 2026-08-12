/**
 * app/admin/fraud/page.tsx
 *
 * Next.js App Router page for Admin Fraud Monitoring.
 * Follows the exact same deep-link pattern as admin/reports/page.tsx and
 * admin/reviews/page.tsx — no sidebar entry, route is /admin/fraud.
 *
 * Metadata is defined here (server component); FraudDashboard is 'use client'.
 */

import type { Metadata } from 'next';
import FraudDashboard from '@/pages/admin/fraud/FraudDashboard';

export const metadata: Metadata = {
  title: 'Fraud Monitoring — VendorHub AI Admin',
  description:
    'Admin fraud signal dashboard: high-risk vendor list, fraud flag frequency, score deterioration alerts, and messaging anomaly detection across the VendorHub AI platform.',
};

export default function AdminFraudPage() {
  return <FraudDashboard />;
}
