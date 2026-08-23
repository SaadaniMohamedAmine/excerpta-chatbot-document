// components/dashboard/CollectionCard.tsx
import Link from "next/link";
import { FilePdf, FileDoc, FileCsv, FileCode, Stack } from "@phosphor-icons/react/dist/ssr";

const ICONS = { pdf: FilePdf, docx: FileDoc, csv: FileCsv, code: FileCode } as const;

export interface CollectionSummary {
  id: string;
  name: string;
  documentCount: number;
  previewDocuments: { id: string; title: string; fileType: "pdf" | "docx" | "csv" | "code" }[];
}

export default function CollectionCard({ collection }: { collection: CollectionSummary }) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary"
    >
      <div className="flex items-center -space-x-2">
        {collection.previewDocuments.length > 0 ? (
          collection.previewDocuments.map((doc) => {
            const Icon = ICONS[doc.fileType] ?? FileDoc;
            return (
              <span key={doc.id} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-background">
                <Icon className="h-4 w-4 text-primary" weight="duotone" />
              </span>
            );
          })
        ) : (
          <Stack className="h-8 w-8 text-primary" weight="duotone" />
        )}
      </div>
      <div>
        <h3 className="truncate font-sans text-sm font-medium text-text-primary group-hover:text-primary">{collection.name}</h3>
        <p className="mt-0.5 font-sans text-xs text-text-secondary">
          {collection.documentCount} document{collection.documentCount === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}
