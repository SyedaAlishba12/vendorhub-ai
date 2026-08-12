import React from 'react';

export interface SkeletonLoaderProps {
  /**
   * Tailwind classes that control width, height, and shape.
   * Example: "h-4 w-3/4 rounded" or "h-32 w-32 rounded-full"
   */
  className?: string;
}

/**
 * SkeletonLoader — a generic animated placeholder block.
 * Usage: <SkeletonLoader className="h-4 w-3/4 rounded" />
 * Compose multiple instances to build skeleton screens for cards, lists, or tables.
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = 'h-4 w-full rounded',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`bg-slate-200 animate-pulse ${className}`}
    />
  );
};

export default SkeletonLoader;
