'use client';

import { useEffect, useState } from 'react';
import apiClient from '../utils/api/apiClient';

interface DashboardData {
  stats: {
    active_rfqs: number;
    pending_quotations: number;
    total_orders: number;
    total_vendors: number;
    total_spending: number;
    monthly_spending: number;
  };
  recent_rfqs: any[];
  active_rfqs: any[];
  pending_quotations: any[];
  orders_summary: {
    total: number;
    in_transit: number;
    delivered: number;
  };
  saved_vendors: any[];
  recent_searches: string[];
  spending: {
    monthly: number;
    last_month: number;
    total: number;
  };
  activity: any[];
  recommendations: any[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/dashboard/buyer');
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { data, loading, error, refetch: fetchDashboard };
}