// components/dashboard/DocumentsExplorer.tsx
"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { MagnifyingGlass, X, CaretLeft, CaretRight, FileText, ChatCircleText, Quotes } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/analytics/StatCard";
import { AnalyticsTeaser } from "./AnalyticsTeaser";
import DocumentGrid, { type DashboardDocument } from "./DocumentGrid";
import { formatFileSize } from "@/lib/format";

const PAGE_SIZE = 8;

export function DocumentsExplorer({
  documents,
  totalConversations,
  citationCount,
}: {
  documents: DashboardDocument[];
  totalConversations: number;
  citationCount: number;
}) {
  const t = useTranslations("Documents");
  const tDashboard = useTranslations("Dashboard");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((doc) => doc.title.toLowerCase().includes(q));
  }, [documents, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const totalSize = useMemo(() => documents.reduce((sum, doc) => sum + doc.fileSize, 0), [documents]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-2 shadow-sm transition-colors focus-within:border-primary/50 focus-within:shadow-md focus-within:shadow-primary/10">
        <div className="group relative w-full max-w-md">
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-primary"
          />
          <Input
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-9 border-transparent bg-transparent pl-9 pr-8 shadow-none focus-visible:border-transparent focus-visible:ring-0"
            aria-label={t("searchAriaLabel")}
          />
          {query && (
            <button
              type="button"
              onClick={() => handleQueryChange("")}
              aria-label={t("clearSearch")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <span className="ml-auto hidden shrink-0 whitespace-nowrap pr-2 font-sans text-xs text-text-secondary sm:inline">
          {t("countAndSize", { count: documents.length, size: formatFileSize(totalSize) })}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface/50 p-4 lg:col-span-2">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary via-primary/50 to-gold/40"
          />

          <div className="flex-1">
            {filtered.length === 0 ? (
              <p className="py-10 text-center font-sans text-sm text-text-secondary">{t("noMatch", { query })}</p>
            ) : (
              <DocumentGrid documents={paginated} />
            )}
          </div>

          {filtered.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 font-sans text-xs text-text-secondary">
              <span>{t("pageOf", { current: currentPage, total: pageCount })}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary"
                >
                  <CaretLeft size={12} weight="bold" />
                  {t("previous")}
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={currentPage === pageCount}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary"
                >
                  {t("next")}
                  <CaretRight size={12} weight="bold" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <AnalyticsTeaser conversationCount={totalConversations} citationCount={citationCount} />
          <StatCard label={tDashboard("statDocuments")} value={documents.length} icon={FileText} />
          <StatCard label={tDashboard("statConversations")} value={totalConversations} icon={ChatCircleText} />
          <StatCard label={tDashboard("statCitationsGiven")} value={citationCount} icon={Quotes} />
        </div>
      </div>
    </div>
  );
}
