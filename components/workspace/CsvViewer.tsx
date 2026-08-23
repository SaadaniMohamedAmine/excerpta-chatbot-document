// components/workspace/CsvViewer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { CircleNotch } from "@phosphor-icons/react";
import type { ActiveCitation } from "./DocumentWorkspace";

interface CsvViewerProps {
  fileUrl: string;
  activeCitation: ActiveCitation | null;
}

/**
 * CSV citations reuse the generic Citation.pageNumber field as a 1-indexed
 * DATA ROW number — the header row is not counted, so row 1 is the first
 * row after the header (see app/api/chat/route.ts's resolveCitationPageNumber,
 * which derives this from the chunk's rowRange).
 *
 * fileUrl is fetched client-side (PapaParse `download: true`), so it must be
 * reachable from the browser — Vercel Blob public URLs are, which is what
 * Phase 2's upload pipeline produces.
 */
export default function CsvViewer({ fileUrl, activeCitation }: CsvViewerProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  useEffect(() => {
    let cancelled = false;
    // Reset loading/error state for the new fileUrl before kicking off the
    // fetch — a standard fetch-on-prop-change pattern, not the "syncing
    // external state" case this lint rule targets.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(false);
    Papa.parse<string[]>(fileUrl, {
      download: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (cancelled) return;
        const data = result.data;
        if (data.length === 0) {
          setError(true);
          setLoading(false);
          return;
        }
        setHeaders(data[0]);
        setRows(data.slice(1));
        setLoading(false);
      },
      error: () => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      },
    });
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!activeCitation) return;
    const rowEl = rowRefs.current.get(activeCitation.pageNumber);
    rowEl?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeCitation]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <CircleNotch className="h-6 w-6 animate-spin text-primary" weight="bold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-background text-sm text-error">
        Couldn&apos;t load this CSV.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <table className="w-full border-collapse font-sans text-sm">
        <thead className="sticky top-0 bg-surface">
          <tr>
            <th className="border-b border-border px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
              #
            </th>
            {headers.map((h, i) => (
              <th
                key={i}
                className="border-b border-border px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-text-secondary"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const rowNumber = i + 1;
            const isCited = activeCitation?.pageNumber === rowNumber;
            return (
              <tr
                key={i}
                ref={(el) => {
                  if (el) rowRefs.current.set(rowNumber, el);
                  else rowRefs.current.delete(rowNumber);
                }}
                className={isCited ? "bg-gold/30" : i % 2 === 0 ? "bg-background" : "bg-surface"}
              >
                <td className="border-b border-border px-3 py-1.5 font-mono text-xs text-text-secondary">
                  {rowNumber}
                </td>
                {row.map((cell, j) => (
                  <td key={j} className="border-b border-border px-3 py-1.5 text-text-primary">
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
