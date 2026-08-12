'use client';
/**
 * components/Risk/RiskScoreGauge.tsx
 * Animated circular gauge that shows the overall risk score.
 * Uses an SVG arc — no charting library needed for this specific widget.
 */

import React, { useEffect, useRef } from 'react';
import { getRiskTier, RISK_TIER_CONFIG } from './types';

interface Props {
  score: number;       // 0-100
  size?: number;       // SVG canvas size in px (default 160)
  strokeWidth?: number;
}

export const RiskScoreGauge: React.FC<Props> = ({ score, size = 160, strokeWidth = 12 }) => {
  const tier = getRiskTier(score);
  const config = RISK_TIER_CONFIG[tier];

  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half-circle arc
  // Arc goes from 180° (left) to 0° (right) — a semicircle
  const progress = Math.max(0, Math.min(1, score / 100));
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size / 2 + strokeWidth }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          {/* Track (grey background arc) */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s' }}
          />
        </svg>
        {/* Center label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-1"
        >
          <span className="text-3xl font-black" style={{ color: config.color }}>
            {score}
          </span>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            / 100
          </span>
        </div>
      </div>
      {/* Tier badge */}
      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${config.bg} ${config.border} ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
};
