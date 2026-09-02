// components/dashboard/QuickActions.tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { UploadSimple, MagnifyingGlass } from "@phosphor-icons/react";

export function QuickActions() {
  const t = useTranslations("Dashboard");

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Link
        href="/documents"
        className="group flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <UploadSimple size={20} weight="duotone" />
        </span>
        <div>
          <h3 className="font-sans text-sm font-medium text-text-primary group-hover:text-primary">
            {t("uploadDocument")}
          </h3>
          <p className="mt-0.5 font-sans text-xs text-text-secondary">{t("uploadDocumentHint")}</p>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("excerpta:open-command-palette"))}
        className="group flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border bg-surface p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <MagnifyingGlass size={20} weight="duotone" />
          </span>
          <div>
            <h3 className="font-sans text-sm font-medium text-text-primary group-hover:text-primary">
              {t("askDocuments")}
            </h3>
            <p className="mt-0.5 font-sans text-xs text-text-secondary">{t("askDocumentsHint")}</p>
          </div>
        </div>
        <kbd className="shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] text-text-secondary">
          ⌘K
        </kbd>
      </button>
    </div>
  );
}
