// components/workspace/ExportModal.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FilePdf, FileDoc, DownloadSimple } from "@phosphor-icons/react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";

type ExportFormat = "pdf" | "docx";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
}

export function ExportModal({ open, onClose, conversationId }: ExportModalProps) {
  const t = useTranslations("ExportModal");
  const tWorkspace = useTranslations("Workspace");
  const tCommon = useTranslations("Common");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FORMATS: Array<{
    id: ExportFormat;
    label: string;
    description: string;
    icon: typeof FilePdf;
  }> = [
    {
      id: "pdf",
      label: t("formatPdfLabel"),
      description: t("formatPdfDescription"),
      icon: FilePdf,
    },
    {
      id: "docx",
      label: t("formatDocxLabel"),
      description: t("formatDocxDescription"),
      icon: FileDoc,
    },
  ];

  async function handleDownload() {
    setIsDownloading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/export?format=${format}`
      );
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `conversation.${format}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      onClose();
    } catch {
      setError(t("downloadFailed"));
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tWorkspace("exportConversation")}
      description={t("description")}
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          {FORMATS.map(({ id, label, description, icon: Icon }) => {
            const selected = format === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFormat(id)}
                aria-pressed={selected}
                className={`flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-surface hover:border-primary/50"
                }`}
              >
                <Icon
                  size={24}
                  weight={selected ? "fill" : "regular"}
                  className={selected ? "text-primary" : "text-text-secondary"}
                />
                <div>
                  <div className="text-sm font-medium text-text-primary">{label}</div>
                  <div className="text-xs text-text-secondary">{description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="mt-2 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            {tCommon("cancel")}
          </button>
          <Button onClick={handleDownload} disabled={isDownloading}>
            <DownloadSimple size={16} className="mr-1.5" />
            {isDownloading ? t("preparing") : t("download")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
