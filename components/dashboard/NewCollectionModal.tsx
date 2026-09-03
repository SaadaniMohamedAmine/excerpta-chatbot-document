// components/dashboard/NewCollectionModal.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewCollectionModalProps {
  onClose: () => void;
  onCreated: (collectionId: string, name: string) => void;
}

export default function NewCollectionModal({ onClose, onCreated }: NewCollectionModalProps) {
  const t = useTranslations("Collections");
  const tCommon = useTranslations("Common");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("nameRequired"));
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
      if (!res.ok) throw new Error(t("createFailed"));
      const collection = await res.json();
      onCreated(collection.id, trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("createFailed"));
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-md duration-200">
      <div className="animate-in fade-in-0 zoom-in-95 relative w-full max-w-sm rounded-lg bg-surface p-6 shadow-xl duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-1 text-text-secondary hover:text-text-primary"
          aria-label={tCommon("close")}
        >
          <X className="h-4 w-4" weight="bold" />
        </button>

        <h2 className="font-sans text-base font-medium text-text-primary">{t("newCollection")}</h2>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("collectionNamePlaceholder")}
          className="mt-4"
          maxLength={80}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        {error && <p className="mt-2 font-sans text-xs text-error">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            {tCommon("cancel")}
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? t("creating") : t("create")}
          </Button>
        </div>
      </div>
    </div>
  );
}
