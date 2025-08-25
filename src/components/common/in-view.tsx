"use client";

import * as React from "react";

type InViewProps = {
  children: React.ReactNode;
  rootMargin?: string;
  once?: boolean;
  fallback?: React.ReactNode;
  className?: string;
};

export function InView({ children, rootMargin = "200px", once = true, fallback = null, className }: InViewProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    if (isVisible && once) return; // already visible and only once
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!cancelled && entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );
    observer.observe(ref.current);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [rootMargin, once, isVisible]);

  return <div ref={ref} className={className}>{isVisible ? children : fallback}</div>;
}


