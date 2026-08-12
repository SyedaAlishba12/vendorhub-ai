'use client';
/**
 * components/Risk/RiskScoreBar.tsx
 * Horizontal score bar for individual scores (financial, delivery).
 */

import React from 'react';
import { getRiskTier, RISK_TIER_CONFIG } from './types';

interface Props {
  label: string;
  score: number;
  icon?: React.ReactNode;
}

export const RiskScoreBar: React.FC<Props> = ({ label, score, icon }) => {
  const tier = getRiskTier(score);
  const config = RISK_TIER_CONFIG[tier];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          {icon && <span className="text-slate-400">{icon}</span>}
          {label}
        </div>
        <span className={`text-xs font-black ${config.text}`}>{score}/100</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${score}%`, backgroundColor: config.color }}
        />
      </div>
    </div>
  );
};
