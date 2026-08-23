// components/workspace/ErrorPanel.tsx
"use client";

import { useState } from "react";
import { WarningCircle, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface ErrorPanelProps {
  documentId: string;
}

export default function ErrorPanel({ documentId }: ErrorPanelProps) {
  const [retrying, setRetrying] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    setRetryFailed(false);
    try {
      const res = await fetch(`/api/documents/${documentId}/retry`, { method: "POST" });
      if (!res.ok) throw new Error("retry failed");
      window.location.reload();
    } catch {
      setRetrying(false);
      setRetryFailed(true);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <WarningCircle className="h-8 w-8 text-error" weight="fill" />
      <div>
        <p className="font-sans text-base font-medium text-text-primary">We couldn&apos;t process this document.</p>
        <p className="mt-1 font-sans text-sm text-text-secondary">Try again, or upload a different file.</p>
      </div>
      <Button onClick={handleRetry} disabled={retrying}>
        <ArrowClockwise className={`mr-1.5 h-4 w-4 ${retrying ? "animate-spin" : ""}`} weight="bold" />
        {retrying ? "Retrying…" : "Retry"}
      </Button>
      {retryFailed && (
        <p className="font-sans text-xs text-error">The retry didn&apos;t go through. Check your connection and try again.</p>
      )}
    </div>
  );
}
