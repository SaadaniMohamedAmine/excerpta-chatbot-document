// components/dashboard/NewCollectionModal.tsx
"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewCollectionModalProps {
  onClose: () => void;
  onCreated: (collectionId: string) => void;
}

export default function NewCollectionModal({ onClose, onCreated }: NewCollectionModalProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the collection a name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error("Couldn't create the collection.");
      const collection = await res.json();
      onCreated(collection.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-sm rounded-lg bg-surface p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-1 text-text-secondary hover:text-text-primary"
          aria-label="Close"
        >
          <X className="h-4 w-4" weight="bold" />
        </button>

        <h2 className="font-sans text-base font-medium text-text-primary">New collection</h2>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collection name"
          className="mt-4"
          maxLength={80}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        {error && <p className="mt-2 font-sans text-xs text-error">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating…" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
