'use client';

import React, { useEffect, useState } from 'react';

export interface FadeInProps {
  /** The content to fade in. */
  children: React.ReactNode;
  /** Duration of the fade-in animation in seconds. Defaults to 0.3. */
  duration?: number;
  /** Delay before the fade-in starts in seconds. Defaults to 0. */
  delay?: number;
}

/**
 * FadeIn — animates its children fading in on mount.
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 0.3,
  delay = 0,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // A small timeout ensures the initial opacity:0 state is rendered before the transition starts
    const timer = setTimeout(() => {
      setMounted(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transition: `opacity ${duration}s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
