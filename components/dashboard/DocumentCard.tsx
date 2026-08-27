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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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
      className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary"
    >
      <div className="flex items-start justify-between">
        <Icon className="h-8 w-8 text-primary" weight="duotone" />
        {document.status === "processing" && (
          <CircleNotch className="h-4 w-4 animate-spin text-text-secondary" weight="bold" />
        )}
        {document.status === "failed" && <WarningCircle className="h-4 w-4 text-error" weight="fill" />}
      </div>

      <div className="min-w-0">
        <h3 className="truncate font-sans text-sm font-medium text-text-primary group-hover:text-primary">
          {document.title}
        </h3>
        <p className="mt-0.5 font-sans text-xs text-text-secondary">{formatDate(document.createdAt)}</p>
      </div>

      <div className="mt-auto flex items-center gap-1 font-sans text-xs text-text-secondary">
        <ChatCircleText className="h-3.5 w-3.5" weight="regular" />
        <span>
          {document.conversationCount} conversation{document.conversationCount === 1 ? "" : "s"}
        </span>
      </div>
    </Link>
  );
}
