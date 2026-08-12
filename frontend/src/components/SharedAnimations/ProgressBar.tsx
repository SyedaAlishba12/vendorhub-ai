'use client';

import React from 'react';

export interface ProgressBarProps {
  /** Progress value from 0 to 100. */
  value: number;
  /** Whether to show a text label of the percentage. Defaults to false. */
  showLabel?: boolean;
  /** Variant for the progress bar color. Defaults to 'default' (blue). */
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

/**
 * ProgressBar — an animated progress indicator.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = false,
  variant = 'default',
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  const variantColor = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
  }[variant];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold text-slate-700">Progress</span>
          <span className="text-xs font-semibold text-slate-700">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className={`${variantColor} h-2 rounded-full`}
          style={{
            width: `${clampedValue}%`,
            transition: 'width 0.4s ease-out',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
