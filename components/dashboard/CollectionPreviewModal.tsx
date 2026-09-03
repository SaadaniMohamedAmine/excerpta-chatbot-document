// components/dashboard/CollectionPreviewModal.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  FilePdf,
  FileDoc,
  FileCsv,
  FileCode,
  FolderStar,
  CircleNotch,
  WarningCircle,
  ChatCircleText,
} from "@phosphor-icons/react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { AddDocumentsToCollectionModal } from "./AddDocumentsToCollectionModal";

const ICONS = { pdf: FilePdf, docx: FileDoc, csv: FileCsv, code: FileCode } as const;

interface PreviewDocument {
  id: string;
  title: string;
  fileType: "pdf" | "docx" | "csv" | "code";
  status: "processing" | "ready" | "failed";
}

export function CollectionPreviewModal({
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
  const [documents, setDocuments] = useState<PreviewDocument[] | null>(null);
  const [addDocumentsOpen, setAddDocumentsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDocuments(null);
    fetch(`/api/collections/${collectionId}`)
      .then((res) => (res.ok ? res.json() : { documents: [] }))
      .then((data: { documents: PreviewDocument[] }) => {
        if (!cancelled) setDocuments(data.documents);
      })
      .catch(() => {
        if (!cancelled) setDocuments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, collectionId]);

  // AddDocumentsToCollectionModal calls this on close whether or not it
  // actually added anything — cheap enough to just always refresh rather
  // than plumb a success flag through.
  function handleAddDocumentsClose() {
    setAddDocumentsOpen(false);
    fetch(`/api/collections/${collectionId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { documents: PreviewDocument[] } | null) => {
        if (data) setDocuments(data.documents);
      })
      .catch(() => {});
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={collectionName} description={t("previewDescription")}>
        {documents === null ? (
          <p className="py-8 text-center font-sans text-xs text-text-secondary">{t("loadingDocuments")}</p>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-2 text-center">
            <button
              type="button"
              onClick={() => setAddDocumentsOpen(true)}
              aria-label={t("addDocumentsCta")}
              className="relative flex h-16 w-16 items-center justify-center rounded-full transition-transform hover:scale-105"
            >
              <span aria-hidden="true" className="absolute inset-0 animate-pulse rounded-full bg-primary/30 blur-xl" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg shadow-primary/40">
                <FolderStar size={26} weight="fill" />
              </span>
            </button>
            <Button onClick={() => setAddDocumentsOpen(true)} size="lg" className="w-full">
              {t("addDocumentsCta")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto">
              {documents.map((doc) => {
                const Icon = ICONS[doc.fileType] ?? FileDoc;
                return (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="flex items-center gap-2 rounded-md border border-border bg-surface p-2.5 transition-colors hover:border-primary/40 hover:bg-background"
                  >
                    <Icon size={16} className="shrink-0 text-primary" weight="duotone" />
                    <span className="min-w-0 flex-1 truncate font-sans text-xs text-text-primary">{doc.title}</span>
                    {doc.status === "processing" && (
                      <CircleNotch className="h-3 w-3 shrink-0 animate-spin text-text-secondary" weight="bold" />
                    )}
                    {doc.status === "failed" && (
                      <WarningCircle className="h-3 w-3 shrink-0 text-error" weight="fill" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2 border-t border-border pt-3">
              <Button variant="secondary" size="sm" onClick={() => setAddDocumentsOpen(true)} className="flex-1">
                {t("addDocumentsCta")}
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link href={`/collections/${collectionId}`}>
                  <ChatCircleText className="mr-1.5 h-4 w-4" weight="bold" />
                  {t("startConversation")}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <AddDocumentsToCollectionModal
        open={addDocumentsOpen}
        collectionId={collectionId}
        collectionName={collectionName}
        onClose={handleAddDocumentsClose}
      />
    </>
  );
}
