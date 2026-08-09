'use client';
/**
 * components/Risk/FraudIndicatorList.tsx
 * Renders fraud flags detected during risk scoring.
 */

import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  indicators: string[];
}

function formatFlag(flag: string): string {
  return flag
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const FraudIndicatorList: React.FC<Props> = ({ indicators }) => {
  if (indicators.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">No fraud indicators detected</span>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {indicators.map((flag) => (
        <li
          key={flag}
          className="flex items-start gap-2.5 text-sm bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5"
        >
          <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <span className="font-medium text-orange-800">{formatFlag(flag)}</span>
        </li>
      ))}
    </ul>
  );
};
