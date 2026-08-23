// components/workspace/CitationHighlightOverlay.tsx
"use client";

import { useEffect } from "react";
import { normalizeForMatch } from "@/lib/citations";

interface CitationHighlightOverlayProps {
  /** CSS selector, queried against `document`, for the react-pdf text-layer
   *  container currently holding the rendered page's <span> nodes. */
  containerSelector: string;
  /** The citation excerpt to search for and highlight. Null clears highlights. */
  excerpt: string | null;
  /** Bump this (e.g. include page/scale/excerpt) to force a re-run. */
  dependencyKey: string;
}

const HIGHLIGHT_CLASS = "citation-highlight";
const MAX_ATTEMPTS = 25;
const RETRY_DELAY_MS = 100;

/**
 * WHY THIS APPROACH, AND ITS LIMITATIONS:
 *
 * react-pdf (via pdf.js) renders one <span> per PDF "text run", not one per
 * word or character, and a text run's boundaries rarely line up with where
 * an excerpt starts or ends — a run can end mid-word. There is no cheap way
 * to get pixel-exact bounding boxes for an arbitrary substring without
 * re-deriving glyph positions from pdf.js's low-level getTextContent() +
 * getViewport() APIs, which is a lot of geometry work for a highlight whose
 * job is "point the user at roughly the right passage", not "select exactly
 * these characters."
 *
 * So instead:
 *   1. Concatenate the textContent of every <span> on the page, in order,
 *      joined by single spaces, tracking each span's [start, end) offset in
 *      that concatenated string.
 *   2. Normalize whitespace/case on both the concatenated text and the
 *      citation excerpt (see normalizeForMatch), then find the excerpt with
 *      a plain substring search (indexOf).
 *   3. Add a CSS class to every span whose offset range overlaps the match
 *      range — the whole span, not a sub-string of it.
 *
 * Because step 3 highlights whole spans, a match that starts or ends
 * mid-span will slightly OVER-highlight (a few extra characters bleed past
 * the exact excerpt boundary) — it will never under-highlight or throw.
 */
export default function CitationHighlightOverlay({
  containerSelector,
  excerpt,
  dependencyKey,
}: CitationHighlightOverlayProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const clearHighlights = (container: Element) => {
      container.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
        el.classList.remove(HIGHLIGHT_CLASS);
      });
    };

    const attempt = () => {
      if (cancelled) return;
      const container = document.querySelector(containerSelector);
      if (!container) {
        attempts += 1;
        if (attempts < MAX_ATTEMPTS) setTimeout(attempt, RETRY_DELAY_MS);
        return;
      }

      clearHighlights(container);
      if (!excerpt) return;

      const spans = Array.from(container.querySelectorAll("span"));
      if (spans.length === 0) {
        attempts += 1;
        if (attempts < MAX_ATTEMPTS) setTimeout(attempt, RETRY_DELAY_MS);
        return;
      }

      const normalizedExcerpt = normalizeForMatch(excerpt);
      if (!normalizedExcerpt) return;

      let concatenated = "";
      const ranges: { span: HTMLElement; start: number; end: number }[] = [];
      for (const span of spans) {
        const normalized = normalizeForMatch(span.textContent ?? "");
        const start = concatenated.length;
        concatenated += (concatenated ? " " : "") + normalized;
        const end = concatenated.length;
        ranges.push({ span: span as HTMLElement, start, end });
      }

      const matchStart = concatenated.indexOf(normalizedExcerpt);
      if (matchStart === -1) return;
      const matchEnd = matchStart + normalizedExcerpt.length;

      let firstHighlighted: HTMLElement | null = null;
      for (const { span, start, end } of ranges) {
        if (end > matchStart && start < matchEnd) {
          span.classList.add(HIGHLIGHT_CLASS);
          if (!firstHighlighted) firstHighlighted = span;
        }
      }
      firstHighlighted?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    attempt();
    return () => {
      cancelled = true;
    };
  }, [containerSelector, excerpt, dependencyKey]);

  return (
    <style jsx global>{`
      .${HIGHLIGHT_CLASS} {
        background-color: rgb(var(--color-gold) / 0.3);
        border-radius: 2px;
      }
    `}</style>
  );
}
