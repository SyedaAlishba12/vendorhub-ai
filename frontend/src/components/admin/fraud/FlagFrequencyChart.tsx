'use client';
/**
 * components/admin/fraud/FlagFrequencyChart.tsx
 *
 * Horizontal bar chart: each bar = one distinct fraud_indicator string,
 * value = number of times that flag appeared across ALL risk_reports rows
 * (not deduplicated by vendor).
 *
 * The "per-report occurrences" counting unit is surfaced in the chart
 * title/subtitle so it's never ambiguous next to the "per-vendor" KPI cards.
 *
 * Uses Chart.js + react-chartjs-2 (already installed via AnalyticsDashboard).
 */

import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { FlagFrequencyData } from './api';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  data: FlagFrequencyData;
}

const FLAG_COLOURS = [
  '#f97316', // orange-500
  '#ef4444', // red-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#64748b', // slate-500
  '#06b6d4', // cyan-500
];

function formatFlag(flag: string): string {
  return flag.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FlagFrequencyChart({ data }: Props) {
  const chartRef = useRef(null);

  if (data.fraud_flag_frequency.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-400 text-xs">
        No fraud flags recorded yet.
      </div>
    );
  }

  const labels  = data.fraud_flag_frequency.map(f => formatFlag(f.flag));
  const counts  = data.fraud_flag_frequency.map(f => f.count);
  const colours = counts.map((_, i) => FLAG_COLOURS[i % FLAG_COLOURS.length]);

  const chartData = {
    labels,
    datasets: [{
      label: 'Occurrences (all reports)',
      data: counts,
      backgroundColor: colours.map(c => c + '22'),
      borderColor: colours,
      borderWidth: 1.5,
      borderRadius: 5,
      borderSkipped: false,
    }],
  };

  const options: import('chart.js').ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.x} report occurrences`,
        },
        bodyFont: { size: 11 },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { font: { size: 10 }, stepSize: 1, precision: 0 },
        grid: { color: 'rgba(0,0,0,0.04)' },
      },
      y: {
        ticks: { font: { size: 10 } },
        grid: { display: false },
      },
    },
  };

  const chartHeight = Math.max(120, data.fraud_flag_frequency.length * 44);

  return (
    <div>
      <p className="text-[10px] text-slate-400 mb-3 font-medium">
        Counts across <strong>all historical reports</strong> — not deduplicated by vendor
      </p>
      <div style={{ height: `${chartHeight}px` }}>
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
