// lib/use-reveal.ts
"use client";

import * as React from "react";

// Tracks whether an element has scrolled into view, once (for one-shot entrance animations).
export function useReveal<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Reduced-motion visibility has to be resolved post-mount, not in the
    // useState initializer, so server and client render the same initial
    // (hidden) markup and React doesn't flag a hydration mismatch.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
