// components/dashboard/NewCollectionModal.tsx
"use client";

import { useState } from "react";
import { X, FilePdf, FileDoc, FileCsv, FileCode, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ICONS = { pdf: FilePdf, docx: FileDoc, csv: FileCsv, code: FileCode } as const;

export interface SelectableDocument {
  id: string;
  title: string;
  fileType: "pdf" | "docx" | "csv" | "code";
}

interface NewCollectionModalProps {
  availableDocuments: SelectableDocument[];
  onClose: () => void;
  onCreated: (collectionId: string) => void;
}

export default function NewCollectionModal({ availableDocuments, onClose, onCreated }: NewCollectionModalProps) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Give the collection a name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const createRes = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!createRes.ok) throw new Error("Couldn't create the collection.");
      const collection = await createRes.json();

      if (selected.size > 0) {
        const addRes = await fetch(`/api/collections/${collection.id}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentIds: Array.from(selected) }),
        });
        if (!addRes.ok) throw new Error("Collection created, but adding documents failed.");
      }

      onCreated(collection.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative flex max-h-[80vh] w-full max-w-md flex-col rounded-lg bg-surface p-5 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-1 text-text-secondary hover:text-text-primary"
          aria-label="Close"
        >
          <X className="h-4 w-4" weight="bold" />
        </button>

        <h2 className="font-sans text-base font-medium text-text-primary">New collection</h2>

        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Collection name" className="mt-4" autoFocus />

        <p className="mb-2 mt-4 font-sans text-xs font-medium uppercase tracking-wide text-text-secondary">Add documents</p>
        <div className="flex-1 overflow-y-auto rounded-md border border-border">
          {availableDocuments.length === 0 ? (
            <p className="px-3 py-4 text-center font-sans text-sm text-text-secondary">No documents yet — upload one first.</p>
          ) : (
            availableDocuments.map((doc) => {
              const Icon = ICONS[doc.fileType] ?? FileDoc;
              const isSelected = selected.has(doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => toggle(doc.id)}
                  className="flex w-full items-center gap-2.5 border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-background"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" weight="regular" />
                  <span className="flex-1 truncate font-sans text-sm text-text-primary">{doc.title}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" weight="bold" />}
                </button>
              );
            })
          )}
        </div>

        {error && <p className="mt-2 font-sans text-xs text-error">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating…" : "Create collection"}
          </Button>
        </div>
      </div>
    </div>
  );
}
