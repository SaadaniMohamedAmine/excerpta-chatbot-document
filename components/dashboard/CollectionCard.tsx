// components/dashboard/CollectionCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FilePdf,
  FileDoc,
  FileCsv,
  FileCode,
  Stack,
  DotsThree,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const ICONS = { pdf: FilePdf, docx: FileDoc, csv: FileCsv, code: FileCode } as const;

export interface CollectionSummary {
  id: string;
  name: string;
  isDefault: boolean;
  documentCount: number;
  previewDocuments: { id: string; title: string; fileType: "pdf" | "docx" | "csv" | "code" }[];
}

export default function CollectionCard({ collection }: { collection: CollectionSummary }) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(collection.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleRename() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === collection.name) {
      setRenaming(false);
      setName(collection.name);
      return;
    }
    await fetch(`/api/collections/${collection.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    setRenaming(false);
    router.refresh();
  }

  async function handleDelete() {
    await fetch(`/api/collections/${collection.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary">
      <div className="absolute right-2 top-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              aria-label="Collection options"
              className="rounded p-1 text-text-secondary opacity-0 transition-opacity hover:text-text-primary group-hover:opacity-100"
            >
              <DotsThree size={18} weight="bold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setRenaming(true);
              }}
            >
              <PencilSimple size={16} /> Rename
            </DropdownMenuItem>
            {!collection.isDefault && (
              <DropdownMenuItem
                destructive
                onSelect={(e) => {
                  e.preventDefault();
                  setConfirmingDelete(true);
                }}
              >
                <Trash size={16} /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/collections/${collection.id}`} className="flex flex-col gap-3">
        <div className="flex items-center -space-x-2">
          {collection.previewDocuments.length > 0 ? (
            collection.previewDocuments.map((doc) => {
              const Icon = ICONS[doc.fileType] ?? FileDoc;
              return (
                <span
                  key={doc.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-background"
                >
                  <Icon className="h-4 w-4 text-primary" weight="duotone" />
                </span>
              );
            })
          ) : (
            <Stack className="h-8 w-8 text-primary" weight="duotone" />
          )}
        </div>
        <div>
          {renaming ? (
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onClick={(e) => e.preventDefault()}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRename();
                }
                if (e.key === "Escape") {
                  setRenaming(false);
                  setName(collection.name);
                }
              }}
              className="h-7 text-sm"
              maxLength={80}
            />
          ) : (
            <h3 className="truncate font-sans text-sm font-medium text-text-primary group-hover:text-primary">
              {collection.name}
              {collection.isDefault && <span className="ml-1.5 font-normal text-text-secondary">(default)</span>}
            </h3>
          )}
          <p className="mt-0.5 font-sans text-xs text-text-secondary">
            {collection.documentCount} document{collection.documentCount === 1 ? "" : "s"}
          </p>
        </div>
      </Link>

      {confirmingDelete && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-surface/97 p-4 text-center">
          <p className="font-sans text-xs text-text-primary">
            {collection.documentCount > 0
              ? `Delete "${collection.name}"? Its ${collection.documentCount} document${
                  collection.documentCount === 1 ? "" : "s"
                } will move to your default collection.`
              : `Delete "${collection.name}"?`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-md border border-border px-3 py-1.5 font-sans text-xs text-text-secondary hover:bg-background"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md bg-error px-3 py-1.5 font-sans text-xs font-medium text-white hover:bg-error/90"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
