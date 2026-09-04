// components/dashboard/AddDocumentsToCollectionModal.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Check, FilePdf, FileDoc, FileCsv, FileCode } from "@phosphor-icons/react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";

const ICONS = { pdf: FilePdf, docx: FileDoc, csv: FileCsv, code: FileCode } as const;

interface DocumentOption {
  id: string;
  title: string;
  fileType: "pdf" | "docx" | "csv" | "code";
}

export function AddDocumentsToCollectionModal({
  open,
  collectionId,
  collectionName,
  onClose,
}: {
  open: boolean;
  collectionId: string;
  collectionName: string;
  onClose: () => void;
}) {
  const t = useTranslations("Collections");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentOption[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/documents")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: DocumentOption[]) => {
        if (!cancelled) setDocuments(data);
      })
      .catch(() => {
        if (!cancelled) setDocuments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAdd() {
    if (selected.size === 0) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/collections/${collectionId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds: Array.from(selected) }),
      });
      if (!res.ok) throw new Error(t("addDocumentsFailed"));
      toast.success(t("documentsAddedToast", { count: selected.size, collection: collectionName }));
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("addDocumentsFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("addDocumentsTitle", { name: collectionName })}
      description={t("addDocumentsDescription")}
    >
      <div className="flex flex-col gap-3">
        <div className="max-h-72 overflow-y-auto rounded-md border border-border">
          {documents === null ? (
            <p className="px-3 py-8 text-center font-sans text-xs text-text-secondary">{t("loadingDocuments")}</p>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
              <p className="font-sans text-xs text-text-secondary">{t("noDocumentsToAdd")}</p>
              <Link href="/documents" className="font-sans text-xs font-medium text-primary hover:underline">
                {t("goToDocumentsPage")}
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {documents.map((doc) => {
                const Icon = ICONS[doc.fileType] ?? FileDoc;
                const checked = selected.has(doc.id);
                return (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => toggle(doc.id)}
                      aria-pressed={checked}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-background"
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          checked ? "border-primary bg-primary text-white" : "border-border"
                        }`}
                      >
                        {checked && <Check size={11} weight="bold" />}
                      </span>
                      <Icon size={16} className="shrink-0 text-primary" weight="regular" />
                      <span className="truncate font-sans text-sm text-text-primary">{doc.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && <p className="font-sans text-xs text-error">{error}</p>}

        <Button onClick={handleAdd} disabled={selected.size === 0 || saving} className="w-full">
          {saving ? tCommon("saving") : t("addSelected", { count: selected.size })}
        </Button>
      </div>
    </Modal>
  );
}
