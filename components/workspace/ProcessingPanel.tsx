// components/workspace/ProcessingPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";

interface ProcessingPanelProps {
  documentId: string;
}

const POLL_INTERVAL_MS = 3000;

/**
 * POLLING VS. REAL-TIME (deliberate tradeoff): a WebSocket/SSE channel would
 * push status changes instantly, but adds real complexity (persistent
 * connection, reconnect/backoff, a server-side channel watching the job
 * queue) for a status that only matters for at most a couple of minutes per
 * document. Polling every 3s is a plain GET, no persistent connection.
 */
export default function ProcessingPanel({ documentId }: ProcessingPanelProps) {
  const [status, setStatus] = useState<"processing" | "ready" | "failed">("processing");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [phase, setPhase] = useState<"reading" | "indexing">("reading");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}`);
        if (!res.ok) return;
        const doc = await res.json();
        if (doc.pageCount) setPageCount(doc.pageCount);
        if (doc.status !== "processing") {
          setStatus(doc.status);
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (doc.status === "ready") {
            // Reload so the server component re-fetches the now-ready
            // document and DocumentWorkspace swaps in the real viewer.
            window.location.reload();
          }
        }
      } catch {
        // Transient network error — the next tick retries.
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [documentId]);

  useEffect(() => {
    const t = setTimeout(() => setPhase("indexing"), 4000);
    return () => clearTimeout(t);
  }, []);

  if (status === "failed") {
    // A page reload (triggered above once status flips) hands control to
    // ErrorPanel via DocumentWorkspace. Render nothing alarming in the gap.
    return null;
  }

  const statusText = phase === "reading" ? "Reading your document…" : `Indexing pages 1–${pageCount ?? "…"}…`;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <CircleNotch className="h-8 w-8 animate-spin text-primary" weight="bold" />
      <p className="font-sans text-base text-text-primary">{statusText}</p>
      <div className="h-1.5 w-64 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
      <p className="font-sans text-xs text-text-secondary">This can take a minute for longer documents.</p>
    </div>
  );
}
