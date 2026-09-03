// components/history/HistoryList.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChatCircleText, MagnifyingGlass, Trash } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { formatRelativeDate } from "@/lib/format";
import type { HistoryItem } from "@/lib/history";

function groupByPeriod(items: HistoryItem[], labels: { today: string; thisWeek: string; earlier: string }) {
  const groups: { label: string; items: HistoryItem[] }[] = [
    { label: labels.today, items: [] },
    { label: labels.thisWeek, items: [] },
    { label: labels.earlier, items: [] },
  ];
  const now = Date.now();

  for (const item of items) {
    const diffDays = Math.floor((now - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) groups[0].items.push(item);
    else if (diffDays < 7) groups[1].items.push(item);
    else groups[2].items.push(item);
  }

  return groups.filter((group) => group.items.length > 0);
}

export function HistoryList({
  initialItems,
  initialNextCursor,
}: {
  initialItems: HistoryItem[];
  initialNextCursor: string | null;
}) {
  const t = useTranslations("HistoryPage");
  const tCommon = useTranslations("Common");
  const tRelative = useTranslations("Common.relativeDate");
  const tConversationHistory = useTranslations("ConversationHistory");
  const locale = useLocale();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Clearing the search reverts to the server-rendered first page instead of
  // refetching it — it's already sitting in props.
  useEffect(() => {
    if (debouncedQuery === "") {
      // Resets to the server-rendered first page when the search box is cleared.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(initialItems);
      setNextCursor(initialNextCursor);
      return;
    }
    let cancelled = false;
    setSearching(true);
    fetch(`/api/conversations/history?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => (res.ok ? res.json() : { items: [], nextCursor: null }))
      .then((data: { items: HistoryItem[]; nextCursor: string | null }) => {
        if (!cancelled) {
          setItems(data.items);
          setNextCursor(data.nextCursor);
        }
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, initialItems, initialNextCursor]);

  // Optimistic, fire-and-forget — same pattern as the sidebar's
  // ConversationHistoryList: the row disappears immediately, and a failed
  // DELETE just leaves it gone from this session (it'll reappear on the
  // next full page load, which is an acceptable edge case here).
  function handleDelete(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    fetch(`/api/conversations/${id}`, { method: "DELETE" }).catch(() => {});
  }

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({ cursor: nextCursor });
      if (debouncedQuery) params.set("q", debouncedQuery);
      const res = await fetch(`/api/conversations/history?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { items: HistoryItem[]; nextCursor: string | null };
        setItems((prev) => [...prev, ...data.items]);
        setNextCursor(data.nextCursor);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  const isSearching = debouncedQuery !== "";
  const hasAnyConversations = initialItems.length > 0 || initialNextCursor !== null;

  if (!hasAnyConversations) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16 text-center">
        <ChatCircleText size={32} className="text-text-secondary" />
        <p className="font-sans text-sm text-text-secondary">{t("emptyStateHint")}</p>
      </div>
    );
  }

  const groups = isSearching
    ? [{ label: "", items }]
    : groupByPeriod(items, {
        today: t("todayGroup"),
        thisWeek: t("thisWeekGroup"),
        earlier: t("earlierGroup"),
      });

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="group relative max-w-sm">
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

      {items.length === 0 && !searching ? (
        <p className="py-10 text-center font-sans text-sm text-text-secondary">
          {t("noMatch", { query: debouncedQuery })}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.label || "search-results"} className="flex flex-col gap-2">
              {group.label && (
                <h2 className="px-1 font-sans text-xs font-medium uppercase tracking-wide text-text-secondary">
                  {group.label}
                </h2>
              )}
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <div className="group relative flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                      <Link href={item.href} className="flex min-w-0 flex-1 items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm shadow-primary/30">
                          <ChatCircleText size={16} weight="duotone" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 pr-6">
                            <span className="truncate font-sans text-sm font-medium text-text-primary group-hover:text-primary">
                              {item.label}
                            </span>
                            <span className="shrink-0 font-sans text-xs text-text-secondary">
                              {formatRelativeDate(item.createdAt, tRelative, locale)}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-1 font-sans text-sm text-text-secondary">
                            {item.preview ?? tCommon("newConversation")}
                          </p>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label={tConversationHistory("delete")}
                        className="absolute right-3 top-3 shrink-0 rounded p-1 text-text-secondary opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
                      >
                        <Trash size={14} weight="regular" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {nextCursor && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="mx-auto mt-2 rounded-md border border-border px-4 py-2 font-sans text-sm text-text-secondary transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore ? t("loadingMore") : t("loadMore")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
