// components/workspace/ErrorPanel.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { WarningCircle, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface ErrorPanelProps {
  documentId: string;
}

export default function ErrorPanel({ documentId }: ErrorPanelProps) {
  const t = useTranslations("ErrorPanel");
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
        <p className="font-sans text-base font-medium text-text-primary">{t("title")}</p>
        <p className="mt-1 font-sans text-sm text-text-secondary">{t("subtitle")}</p>
      </div>
      <Button onClick={handleRetry} disabled={retrying}>
        <ArrowClockwise className={`mr-1.5 h-4 w-4 ${retrying ? "animate-spin" : ""}`} weight="bold" />
        {retrying ? t("retrying") : t("retry")}
      </Button>
      {retryFailed && <p className="font-sans text-xs text-error">{t("retryFailed")}</p>}
    </div>
  );
}
