// delays rendering of children until the component is scrolled into view

"use client";

import * as React from "react";

type InViewProps = {
  children: React.ReactNode;        // Content to render once visible
  rootMargin?: string;              // Margin around the viewport for visibility check (default: "200px")
  once?: boolean;                   // If true, children render only once and stay visible
  fallback?: React.ReactNode;       // Content shown before the children are visible
  className?: string;               // Optional CSS class for the wrapper div
};

/**
 * InView component:
 * Uses IntersectionObserver to delay rendering of its children
 * until they are scrolled into the viewport.
 */
export function InView({
  children,
  rootMargin = "200px",
  once = true,
  fallback = null,
  className
}: InViewProps) {
  // Track whether the element is visible in viewport
  const [isVisible, setIsVisible] = React.useState(false);

  // Reference to the wrapper div that IntersectionObserver will watch
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;              // No element to observe yet
    if (isVisible && once) return;         // Already visible and only once → no need to observe further

    let cancelled = false;

    // Create a new IntersectionObserver to detect when element enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]; // Only one element is being observed
        if (!cancelled && entry.isIntersecting) {
          setIsVisible(true);     // Mark as visible → children will render
          if (once) observer.disconnect(); // Stop observing if only once
        }
      },
      {
        root: null,               // Uses browser viewport as root
        rootMargin,               // Expands/shrinks viewport detection area
        threshold: 0.01           // Fire event if at least 1% of element is visible
      }
    );

    // Start observing the element
    observer.observe(ref.current);

    // disconnect observer if component unmounts or re-renders
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [rootMargin, once, isVisible]);

  // Render wrapper div
  // → Shows children if visible, otherwise fallback
  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
}
