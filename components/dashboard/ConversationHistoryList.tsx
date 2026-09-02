// components/dashboard/ConversationHistoryList.tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Trash } from "@phosphor-icons/react";

interface ConversationScope {
  kind: "document" | "collection";
  id: string;
}

interface ConversationListItem {
  id: string;
  createdAt: string;
  firstMessagePreview: string;
}

interface ConversationHistoryListProps {
  scope: ConversationScope;
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function ConversationHistoryList({ scope, activeConversationId, onSelect }: ConversationHistoryListProps) {
  const t = useTranslations("ConversationHistory");
  const [items, setItems] = useState<ConversationListItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url =
      scope.kind === "document" ? `/api/documents/${scope.id}/conversations` : `/api/collections/${scope.id}/conversations`;
    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [scope.kind, scope.id]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItems((prev) => prev?.filter((c) => c.id !== id) ?? prev);
    await fetch(`/api/conversations/${id}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <div className="max-h-56 overflow-y-auto border-b border-border bg-surface">
      {items === null ? (
        <p className="px-4 py-3 font-sans text-xs text-text-secondary">{t("loading")}</p>
      ) : items.length === 0 ? (
        <p className="px-4 py-3 font-sans text-xs text-text-secondary">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={`group flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-background ${
                  item.id === activeConversationId ? "bg-background" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-xs text-text-secondary">{formatTimestamp(item.createdAt)}</p>
                  <p className="truncate font-sans text-sm text-text-primary">{item.firstMessagePreview}</p>
                </div>
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => handleDelete(e, item.id)}
                  className="shrink-0 rounded p-1 text-text-secondary opacity-0 hover:text-error group-hover:opacity-100"
                  aria-label={t("delete")}
                >
                  <Trash className="h-3.5 w-3.5" weight="regular" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
