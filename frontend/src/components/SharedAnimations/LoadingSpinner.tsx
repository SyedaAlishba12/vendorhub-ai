import React from 'react';

/** Maps size prop to Tailwind dimension classes */
const sizeMap = {
  sm: 'h-5 w-5 border-2',
  md: 'h-9 w-9 border-[3px]',
  lg: 'h-14 w-14 border-4',
} as const;

export interface LoadingSpinnerProps {
  /** Controls the diameter of the spinner. Defaults to 'md'. */
  size?: keyof typeof sizeMap;
  /** Optional accessible label shown below the spinner. */
  label?: string;
  /** Additional class names to apply to the wrapper div. */
  className?: string;
}

/**
 * LoadingSpinner — centered animated spinner.
 * Usage: <LoadingSpinner size="lg" label="Loading data…" />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-label={label ?? 'Loading'}
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <span
        className={`
          inline-block rounded-full
          border-slate-200 border-t-indigo-600
          animate-spin
          ${sizeMap[size]}
        `}
      />
      {label && (
        <span className="text-xs font-medium text-slate-500 select-none">
          {label}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
