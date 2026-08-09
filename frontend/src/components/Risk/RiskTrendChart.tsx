'use client';
/**
 * components/Risk/RiskTrendChart.tsx
 * Line chart of overall_risk_score over time using react-chartjs-2.
 */

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { RiskReport } from './types';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

interface Props {
  reports: RiskReport[];
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const RiskTrendChart: React.FC<Props> = ({ reports }) => {
  if (reports.length < 2) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-slate-400">
        Run at least 2 analyses to see a trend.
      </div>
    );
  }

  // Reverse so oldest is on the left
  const sorted = [...reports].reverse();

  const data = {
    labels: sorted.map((r) => shortDate(r.created_at)),
    datasets: [
      {
        label: 'Overall Score',
        data: sorted.map((r) => r.overall_risk_score),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Financial',
        data: sorted.map((r) => r.financial_risk_score),
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderDash: [4, 4],
        pointRadius: 3,
      },
      {
        label: 'Delivery',
        data: sorted.map((r) => r.delivery_risk_score),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderDash: [4, 4],
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { font: { size: 10, weight: 'bold' as const }, boxWidth: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}/100`,
        },
      },
    },
    scales: {
      y: {
        min: 0, max: 100,
        ticks: { font: { size: 10 }, stepSize: 20 },
        grid: { color: 'rgba(0,0,0,0.04)' },
      },
      x: { ticks: { font: { size: 10 } }, grid: { display: false } },
    },
  };

  return (
    <div style={{ height: 200 }}>
      <Line data={data} options={options} />
    </div>
  );
};
