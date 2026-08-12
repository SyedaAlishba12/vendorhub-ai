'use client';

import React, { useEffect, useState } from 'react';

export interface PageTransitionProps {
  /** Content to fade in when the component mounts. */
  children: React.ReactNode;
  /** Additional class names for the wrapper div. */
  className?: string;
  /** Duration of the fade-in in milliseconds. Defaults to 300. */
  durationMs?: number;
}

/**
 * PageTransition — wraps page content and fades it in on mount.
 * Usage: <PageTransition><YourPageContent /></PageTransition>
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  durationMs = 300,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight defer so the initial opacity:0 paint lands before transition starts
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: 'ease-out',
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
