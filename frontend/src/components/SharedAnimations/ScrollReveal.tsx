'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface ScrollRevealProps {
  /** The content to reveal on scroll. */
  children: React.ReactNode;
  /** Intersection threshold (0.0 to 1.0) before triggering the reveal. Defaults to 0.1. */
  threshold?: number;
}

/**
 * ScrollReveal — animates children in (fade + slight upward translate) 
 * when they scroll into the viewport.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  threshold = 0.1,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Only trigger once
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
