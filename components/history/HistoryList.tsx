// components/history/HistoryList.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CaretLeft, CaretRight, ChatCircleText, MagnifyingGlass, Trash } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { formatRelativeDate } from "@/lib/format";
import type { HistoryItem } from "@/lib/history";

// Kept in sync with lib/history.ts's HISTORY_PAGE_SIZE — not imported
// directly since that module pulls in the server-only Prisma client.
const PAGE_SIZE = 12;

export function HistoryList({
  initialItems,
  initialTotalCount,
}: {
  initialItems: HistoryItem[];
  initialTotalCount: number;
}) {
  const t = useTranslations("HistoryPage");
  const tCommon = useTranslations("Common");
  const tDocuments = useTranslations("Documents");
  const tRelative = useTranslations("Common.relativeDate");
  const tConversationHistory = useTranslations("ConversationHistory");
  const locale = useLocale();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(initialItems);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [loading, setLoading] = useState(false);

  // Debounces the query, and resets to page 1 in the same batch so the
  // fetch effect below never runs with a (new query, stale page) pair.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (page === 1 && debouncedQuery === "") {
      // Matches what the server already rendered — reuse it instead of refetching.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(initialItems);
      setTotalCount(initialTotalCount);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (debouncedQuery) params.set("q", debouncedQuery);
    fetch(`/api/conversations/history?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { items: [], totalCount: 0 }))
      .then((data: { items: HistoryItem[]; totalCount: number }) => {
        if (!cancelled) {
          setItems(data.items);
          setTotalCount(data.totalCount);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedQuery, initialItems, initialTotalCount]);

  // Optimistic, fire-and-forget — same pattern as the sidebar's
  // ConversationHistoryList: the card disappears immediately, and a failed
  // DELETE just leaves it gone from this session. Stepping back a page when
  // the last card on a non-first page is removed avoids landing on an empty
  // page — the page-change effect refetches from there.
  function handleDelete(id: string) {
    setTotalCount((prev) => Math.max(0, prev - 1));
    if (items.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
    fetch(`/api/conversations/${id}`, { method: "DELETE" }).catch(() => {});
  }

  const hasAnyConversations = initialTotalCount > 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (!hasAnyConversations) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16 text-center">
        <ChatCircleText size={32} className="text-text-secondary" />
        <p className="font-sans text-sm text-text-secondary">{t("emptyStateHint")}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="group relative">
        <MagnifyingGlass
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-primary"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchAriaLabel")}
          className="pl-9"
        />
      </div>

      {items.length === 0 && !loading ? (
        <p className="py-10 text-center font-sans text-sm text-text-secondary">
          {debouncedQuery ? t("noMatch", { query: debouncedQuery }) : t("noConversationsYet")}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-gradient-to-b from-surface to-background p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-primary to-gold/60"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  aria-label={tConversationHistory("delete")}
                  className="absolute right-2 top-3 z-10 rounded p-1 text-text-secondary opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
                >
                  <Trash size={14} weight="regular" />
                </button>
                <Link href={item.href} className="flex flex-1 flex-col gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-md shadow-primary/30">
                    <ChatCircleText size={18} weight="duotone" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-sans text-sm font-medium text-text-primary group-hover:text-primary">
                      {item.label}
                    </h3>
                    <span className="mt-0.5 block font-sans text-xs text-text-secondary">
                      {formatRelativeDate(item.createdAt, tRelative, locale)}
                    </span>
                    <p className="mt-1.5 line-clamp-2 font-sans text-xs text-text-secondary">
                      {item.preview ?? tCommon("newConversation")}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-2 flex items-center justify-between border-t border-border pt-4 font-sans text-xs text-text-secondary">
              <span>{tDocuments("pageOf", { current: page, total: pageCount })}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary"
                >
                  <CaretLeft size={12} weight="bold" />
                  {tDocuments("previous")}
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page === pageCount}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary"
                >
                  {tDocuments("next")}
                  <CaretRight size={12} weight="bold" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
