// components/dashboard/DocumentsExplorer.tsx
"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import DocumentGrid, { type DashboardDocument } from "./DocumentGrid";

export function DocumentsExplorer({ documents }: { documents: DashboardDocument[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((doc) => doc.title.toLowerCase().includes(q));
  }, [documents, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <MagnifyingGlass
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search documents…"
          className="pl-9 pr-8"
          aria-label="Search documents"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center font-sans text-sm text-text-secondary">
          No documents match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <DocumentGrid documents={filtered} />
      )}
    </div>
  );
}
