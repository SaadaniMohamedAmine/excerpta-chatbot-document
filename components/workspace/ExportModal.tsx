// components/workspace/ExportModal.tsx
"use client";

import { useState } from "react";
import { FilePdf, FileDoc, DownloadSimple } from "@phosphor-icons/react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";

type ExportFormat = "pdf" | "docx";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
}

const FORMATS: Array<{
  id: ExportFormat;
  label: string;
  description: string;
  icon: typeof FilePdf;
}> = [
  {
    id: "pdf",
    label: "PDF",
    description: "Fixed layout, portable, ready to print.",
    icon: FilePdf,
  },
  {
    id: "docx",
    label: "Word (.docx)",
    description: "Editable in Word or Google Docs.",
    icon: FileDoc,
  },
];

export function ExportModal({ open, onClose, conversationId }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("Couldn't generate the file. Try again in a moment.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export conversation"
      description="Save this conversation, with citations, as a document."
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
            Cancel
          </button>
          <Button onClick={handleDownload} disabled={isDownloading}>
            <DownloadSimple size={16} className="mr-1.5" />
            {isDownloading ? "Preparing…" : "Download"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
