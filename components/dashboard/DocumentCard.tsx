// components/dashboard/DocumentCard.tsx
import Link from "next/link";
import {
  FilePdf,
  FileDoc,
  FileCsv,
  FileCode,
  ChatCircleText,
  CircleNotch,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { DashboardDocument } from "./DocumentGrid";

const ICONS = { pdf: FilePdf, docx: FileDoc, csv: FileCsv, code: FileCode } as const;
const FILE_TYPE_LABELS = { pdf: "PDF", docx: "DOCX", csv: "CSV", code: "Code" } as const;

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentCard({
  document,
  highlightForTour = false,
}: {
  document: DashboardDocument;
  highlightForTour?: boolean;
}) {
  const Icon = ICONS[document.fileType] ?? FileDoc;

  return (
    <Link
      href={`/documents/${document.id}`}
      data-tour={highlightForTour ? "demo-document-card" : undefined}
      className="group flex cursor-pointer flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Icon size={22} weight="duotone" />
        </span>
        {document.status === "processing" && (
          <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
            <CircleNotch className="h-3 w-3 animate-spin" weight="bold" />
            Processing
          </span>
        )}
        {document.status === "failed" && (
          <span className="flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-medium text-error">
            <WarningCircle className="h-3 w-3" weight="fill" />
            Failed
          </span>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="truncate font-sans text-sm font-medium text-text-primary group-hover:text-primary">
          {document.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 font-sans text-xs text-text-secondary">
          <span className="rounded border border-border px-1.5 py-0.5 font-medium uppercase tracking-wide">
            {FILE_TYPE_LABELS[document.fileType] ?? document.fileType}
          </span>
          <span>{formatFileSize(document.fileSize)}</span>
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between font-sans text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <ChatCircleText className="h-3.5 w-3.5" weight="regular" />
          {document.conversationCount} conversation{document.conversationCount === 1 ? "" : "s"}
        </span>
        <span>{formatRelativeDate(document.createdAt)}</span>
      </div>
    </Link>
  );
}
