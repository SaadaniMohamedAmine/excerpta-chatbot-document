// components/ui/page-loader.tsx
"use client";

import * as React from "react";

const DURATION_MS = 1400;
const HOLD_MS = 250;
const FADE_MS = 350;

export function PageLoader() {
  const [progress, setProgress] = React.useState(0);
  const [fading, setFading] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHidden(true);
      return;
    }

    document.body.style.overflow = "hidden";
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const t = Math.min((now - start) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));

      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setFading(true);
        window.setTimeout(() => setHidden(true), FADE_MS);
      }
    }

    const holdTimeout = window.setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, HOLD_MS);

    return () => {
      window.clearTimeout(holdTimeout);
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
    };
  }, []);

  React.useEffect(() => {
    if (hidden) document.body.style.overflow = "";
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      role="status"
      aria-label="Loading Excerpta"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background transition-opacity duration-300 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full bg-primary/30 blur-2xl"
        />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-lg shadow-primary/20">
          <span className="font-serif text-2xl font-semibold text-primary">Ex</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="font-serif text-3xl font-semibold tracking-tight text-primary">
          Excerpta
        </span>
        <span className="text-xs uppercase tracking-[0.2em] text-text-secondary">
          Every answer, cited to the page
        </span>
      </div>

      <div className="flex w-56 flex-col gap-2">
        <div className="h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-gold"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-text-secondary">
          <span>Loading</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
