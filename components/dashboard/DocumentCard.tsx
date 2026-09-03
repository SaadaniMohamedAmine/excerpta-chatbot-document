// components/dashboard/DocumentCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  FilePdf,
  FileDoc,
  FileCsv,
  FileCode,
  ChatCircleText,
  CircleNotch,
  WarningCircle,
  DotsThree,
  FolderStar,
} from "@phosphor-icons/react";
import { formatRelativeDate, formatFileSize } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import CollectionAssignPopup from "./CollectionAssignPopup";
import type { DashboardDocument } from "./DocumentGrid";

const ICONS = { pdf: FilePdf, docx: FileDoc, csv: FileCsv, code: FileCode } as const;
const FILE_TYPE_LABELS = { pdf: "PDF", docx: "DOCX", csv: "CSV", code: "Code" } as const;

export default function DocumentCard({
  document,
  highlightForTour = false,
}: {
  document: DashboardDocument;
  highlightForTour?: boolean;
}) {
  const t = useTranslations("Documents");
  const tRelative = useTranslations("Common.relativeDate");
  const locale = useLocale();
  const Icon = ICONS[document.fileType] ?? FileDoc;
  const [assignPopupOpen, setAssignPopupOpen] = useState(false);

  return (
    <div className="group relative flex w-full flex-col gap-3 overflow-hidden rounded-lg border border-border bg-gradient-to-b from-surface to-background p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-primary to-gold/60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgb(var(--color-primary)/0.12),_transparent_60%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />

      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t("documentOptions")}
              className="rounded p-1 text-text-secondary opacity-0 transition-opacity hover:text-text-primary group-hover:opacity-100"
            >
              <DotsThree size={18} weight="bold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setAssignPopupOpen(true)}>
              <FolderStar size={16} /> {t("moveToCollection")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link
        href={`/documents/${document.id}`}
        data-tour={highlightForTour ? "demo-document-card" : undefined}
        className="flex flex-1 flex-col gap-3"
      >
        <div className="relative flex items-start justify-between pr-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-md shadow-primary/30 transition-transform group-hover:scale-105">
            <Icon size={24} weight="duotone" />
          </span>
          {document.status === "processing" && (
            <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
              <CircleNotch className="h-3 w-3 animate-spin" weight="bold" />
              {t("statusProcessing")}
            </span>
          )}
          {document.status === "failed" && (
            <span className="flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-medium text-error">
              <WarningCircle className="h-3 w-3" weight="fill" />
              {t("statusFailed")}
            </span>
          )}
        </div>

        <div className="relative min-w-0">
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

        <div className="relative mt-auto flex items-center justify-between font-sans text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <ChatCircleText className="h-3.5 w-3.5" weight="regular" />
            {t("conversationCount", { count: document.conversationCount })}
          </span>
          <span>{formatRelativeDate(document.createdAt, tRelative, locale)}</span>
        </div>
      </Link>

      {assignPopupOpen && (
        <CollectionAssignPopup
          documentId={document.id}
          documentTitle={document.title}
          onDismiss={() => setAssignPopupOpen(false)}
        />
      )}
    </div>
  );
}
