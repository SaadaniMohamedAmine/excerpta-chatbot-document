// components/dashboard/DocumentsExplorer.tsx
"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass, X, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import DocumentGrid, { type DashboardDocument } from "./DocumentGrid";

const PAGE_SIZE = 8;

export function DocumentsExplorer({ documents }: { documents: DashboardDocument[] }) {
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-w-md items-center gap-3 rounded-lg border border-border bg-surface p-2 shadow-sm">
        <div className="group relative w-full">
          <MagnifyingGlass
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-primary"
          />
          <Input
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Search documents…"
            className="h-9 border-transparent bg-transparent pl-9 pr-8 shadow-none focus-visible:border-transparent focus-visible:ring-0"
            aria-label="Search documents"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleQueryChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center font-sans text-sm text-text-secondary">
          No documents match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <>
          <DocumentGrid documents={paginated} />
          {pageCount > 1 && (
            <div className="flex items-center justify-between font-sans text-xs text-text-secondary">
              <span>
                Page {currentPage} of {pageCount}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary"
                >
                  <CaretLeft size={12} weight="bold" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={currentPage === pageCount}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary"
                >
                  Next
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
