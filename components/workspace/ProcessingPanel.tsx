// components/workspace/ProcessingPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CircleNotch, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface ProcessingPanelProps {
  documentId: string;
}

const POLL_INTERVAL_MS = 3000;
// If it's still "processing" after this long, the trigger most likely never
// reached the workflow route (or the route hit Vercel's maxDuration and got
// killed externally, which never runs the try/catch that would otherwise
// flip status to "failed") — offer a manual way out instead of polling
// silently forever.
const STUCK_AFTER_MS = 90_000;

/**
 * POLLING VS. REAL-TIME (deliberate tradeoff): a WebSocket/SSE channel would
 * push status changes instantly, but adds real complexity (persistent
 * connection, reconnect/backoff, a server-side channel watching the job
 * queue) for a status that only matters for at most a couple of minutes per
 * document. Polling every 3s is a plain GET, no persistent connection.
 */
export default function ProcessingPanel({ documentId }: ProcessingPanelProps) {
  const t = useTranslations("ProcessingPanel");
  const [status, setStatus] = useState<"processing" | "ready" | "failed">("processing");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [phase, setPhase] = useState<"reading" | "indexing">("reading");
  const [stuck, setStuck] = useState(false);
  const [retrying, setRetrying] = useState(false);
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
          // Reload either way so the server component re-fetches the
          // document and DocumentWorkspace swaps in the real viewer (ready)
          // or ErrorPanel (failed) — without this, a "failed" status was
          // only ever reflected in this component's own local state, which
          // the render below discards (`return null`), leaving the screen
          // blank instead of showing the actual error.
          window.location.reload();
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

  useEffect(() => {
    const t = setTimeout(() => setStuck(true), STUCK_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  async function handleRetry() {
    setRetrying(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/retry`, { method: "POST" });
      if (!res.ok) throw new Error("retry failed");
      window.location.reload();
    } catch {
      setRetrying(false);
    }
  }

  if (status === "failed") {
    // A page reload (triggered above once status flips) hands control to
    // ErrorPanel via DocumentWorkspace. Render nothing alarming in the gap.
    return null;
  }

  const statusText = phase === "reading" ? t("reading") : t("indexing", { pageCount: pageCount ?? "…" });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <CircleNotch className="h-8 w-8 animate-spin text-primary" weight="bold" />
      <p className="font-sans text-base text-text-primary">{statusText}</p>
      <div className="h-1.5 w-64 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
      <p className="font-sans text-xs text-text-secondary">{t("hint")}</p>

      {stuck && (
        <div className="mt-2 flex flex-col items-center gap-2 border-t border-border pt-4">
          <p className="font-sans text-xs text-text-secondary">{t("stuckHint")}</p>
          <Button variant="secondary" size="sm" onClick={handleRetry} disabled={retrying}>
            <ArrowClockwise className={`mr-1.5 h-4 w-4 ${retrying ? "animate-spin" : ""}`} weight="bold" />
            {retrying ? t("retrying") : t("retryNow")}
          </Button>
        </div>
      )}
    </div>
  );
}
