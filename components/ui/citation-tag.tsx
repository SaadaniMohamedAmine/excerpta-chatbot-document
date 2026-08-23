// components/ui/citation-tag.tsx
"use client";

import { cn } from "@/lib/utils";

export interface CitationTagProps {
  page?: number | string;
  label?: string;
  /** When set, renders "[DocumentTitle, p.X]" instead of "[p. X]" — used
   *  where a citation can come from any of several documents (collection chat). */
  documentTitle?: string;
  className?: string;
  onClick?: () => void;
}

export function CitationTag({ page, label, documentTitle, className, onClick }: CitationTagProps) {
  const pageText = page !== undefined ? `p. ${page}` : "source";
  const text = label ?? (documentTitle ? `${documentTitle}, ${pageText}` : pageText);

  const classes = cn(
    "inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-text-primary transition-colors",
    onClick &&
      "cursor-pointer hover:bg-gold/20 hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
    className
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        [{text}]
      </button>
    );
  }

  return <span className={classes}>[{text}]</span>;
}
