// components/ui/route-transition-overlay.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { BarLoader } from "@/components/ui/bar-loader";

const MIN_VISIBLE_MS = 350;
const SAFETY_TIMEOUT_MS = 5000;

// Global click listener rather than per-Link wiring: catches every internal
// navigation (navbar, sidebar, footer, CTAs) without having to remember to
// wire each one up individually.
export function RouteTransitionOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);
  const shownAtRef = React.useRef(0);
  const prevPathnameRef = React.useRef(pathname);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      // Note: next/link's own click handler calls preventDefault() to do a
      // client-side navigation, and (via React's event delegation) runs
      // before this listener — so e.defaultPrevented is already true for
      // every normal Link click. Don't gate on it.
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      shownAtRef.current = Date.now();
      setVisible(true);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  React.useEffect(() => {
    if (!visible) return;

    // Safety valve: never get stuck showing this if navigation doesn't land.
    const safety = window.setTimeout(() => setVisible(false), SAFETY_TIMEOUT_MS);
    return () => window.clearTimeout(safety);
  }, [visible]);

  React.useEffect(() => {
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;
    if (!visible) return;

    const elapsed = Date.now() - shownAtRef.current;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);
    const timeout = window.setTimeout(() => setVisible(false), remaining);
    return () => window.clearTimeout(timeout);
  }, [pathname, visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <BarLoader />
    </div>
  );
}
