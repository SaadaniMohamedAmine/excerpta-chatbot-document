// components/dashboard/CollectionAssignPopup.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X, Check, FolderStar, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CollectionOption {
  id: string;
  name: string;
  isDefault: boolean;
  documentCount: number;
}

interface CollectionAssignPopupProps {
  documentId: string;
  onDismiss: () => void;
}

export default function CollectionAssignPopup({ documentId, onDismiss }: CollectionAssignPopupProps) {
  const t = useTranslations("CollectionPopup");
  const tCommon = useTranslations("Common");
  const [collections, setCollections] = useState<CollectionOption[] | null>(null);
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(""); // collection id, or "__new__"
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [collectionsRes, assignmentRes] = await Promise.all([
        fetch("/api/collections"),
        fetch(`/api/documents/${documentId}/collection`),
      ]);
      if (cancelled || !collectionsRes.ok || !assignmentRes.ok) return;

      const { collections: fetched } = (await collectionsRes.json()) as { collections: CollectionOption[] };
      const { collection: assigned } = (await assignmentRes.json()) as {
        collection: { id: string; name: string; isDefault: boolean };
      };
      if (cancelled) return;

      setCollections(fetched);
      setCurrentCollectionId(assigned.id);

      // First collection the account has ever had (just created by
      // resolveUploadCollectionId for this document) — nothing else to pick
      // from, so open straight into "rename" instead of a one-option list.
      if (fetched.length <= 1) {
        setSelected("__new__");
        setNewName(assigned.name);
      } else {
        setSelected(assigned.id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  useEffect(() => {
    if (selected === "__new__") nameInputRef.current?.focus();
  }, [selected]);

  const isFirstCollectionEver = collections !== null && collections.length <= 1;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (selected === "__new__") {
        const trimmed = newName.trim();
        if (!trimmed) {
          setError(t("nameRequired"));
          setSaving(false);
          return;
        }
        if (isFirstCollectionEver && currentCollectionId) {
          // Renaming the default collection that was just created, not
          // creating a second collection.
          const res = await fetch(`/api/collections/${currentCollectionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmed }),
          });
          if (!res.ok) throw new Error(t("renameFailed"));
        } else {
          const res = await fetch(`/api/documents/${documentId}/collection`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newCollectionName: trimmed }),
          });
          if (!res.ok) throw new Error(t("createFailed"));
        }
      } else if (selected && selected !== currentCollectionId) {
        const res = await fetch(`/api/documents/${documentId}/collection`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collectionId: selected }),
        });
        if (!res.ok) throw new Error(t("moveFailed"));
      }
      onDismiss();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setSaving(false);
    }
  }

  if (collections === null) return null; // no skeleton — shows up already loaded, or not at all

  return (
    <div className="animate-in fade-in-0 slide-in-from-top-2 fixed right-6 top-20 z-40 w-80 rounded-lg border border-border bg-surface p-4 shadow-xl duration-200">
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t("dismiss")}
        className="absolute right-2.5 top-2.5 rounded p-1 text-text-secondary hover:text-text-primary"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-2 pr-5">
        <FolderStar size={18} className="text-primary" weight="duotone" />
        <h3 className="font-sans text-sm font-medium text-text-primary">
          {isFirstCollectionEver ? t("nameFirstCollection") : t("addToCollection")}
        </h3>
      </div>

      {isFirstCollectionEver ? (
        <>
          <p className="mt-1.5 font-sans text-xs text-text-secondary">{t("firstCollectionHint")}</p>
          <Input
            ref={nameInputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-3"
            maxLength={80}
          />
        </>
      ) : (
        <>
          <p className="mt-1.5 font-sans text-xs text-text-secondary">
            {t("savedTo", { name: collections.find((c) => c.id === currentCollectionId)?.name ?? "" })}
          </p>
          <div className="mt-3 flex flex-col gap-1.5">
            {collections.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={`flex items-center justify-between rounded-md border px-2.5 py-2 text-left font-sans text-sm transition-colors ${
                  selected === c.id
                    ? "border-primary bg-primary/10 text-text-primary"
                    : "border-border text-text-secondary hover:bg-background"
                }`}
              >
                <span className="truncate">
                  {c.name}
                  {c.isDefault && <span className="ml-1.5 text-xs text-text-secondary">{t("defaultBadge")}</span>}
                </span>
                {selected === c.id && <Check size={14} className="shrink-0 text-primary" weight="bold" />}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelected("__new__")}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-left font-sans text-sm transition-colors ${
                selected === "__new__"
                  ? "border-primary bg-primary/10 text-text-primary"
                  : "border-border text-text-secondary hover:bg-background"
              }`}
            >
              <Plus size={14} weight="bold" />
              {t("createNewCollection")}
            </button>
          </div>
          {selected === "__new__" && (
            <Input
              ref={nameInputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("collectionNamePlaceholder")}
              className="mt-2"
              maxLength={80}
            />
          )}
        </>
      )}

      {error && <p className="mt-2 font-sans text-xs text-error">{error}</p>}

      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDismiss} disabled={saving}>
          {tCommon("skip")}
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? tCommon("saving") : tCommon("save")}
        </Button>
      </div>
    </div>
  );
}
