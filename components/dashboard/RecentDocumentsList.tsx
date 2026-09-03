// components/dashboard/RecentDocumentsList.tsx
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FilePdf, FileDoc, FileCsv, FileCode, CircleNotch, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { formatRelativeDate } from "@/lib/format";

const ICONS = { pdf: FilePdf, docx: FileDoc, csv: FileCsv, code: FileCode } as const;

export interface RecentDocument {
  id: string;
  title: string;
  fileType: "pdf" | "docx" | "csv" | "code";
  status: "processing" | "ready" | "failed";
  createdAt: string;
}

export function RecentDocumentsList({ documents }: { documents: RecentDocument[] }) {
  const t = useTranslations("Dashboard");
  const tRelative = useTranslations("Common.relativeDate");
  const locale = useLocale();

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-sm font-medium text-text-primary">{t("recentDocuments")}</h2>
        <Link href="/documents" className="font-sans text-xs text-primary hover:underline">
          {t("viewAll")}
        </Link>
      </div>

      {documents.length === 0 ? (
        <p className="mt-4 font-sans text-sm text-text-secondary">{t("noDocumentsYet")}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1">
          {documents.map((doc) => {
            const Icon = ICONS[doc.fileType] ?? FileDoc;
            return (
              <li key={doc.id}>
                <Link
                  href={`/documents/${doc.id}`}
                  className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-background"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon size={16} weight="duotone" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-sans text-sm text-text-primary">
                    {doc.title}
                  </span>
                  {doc.status === "processing" && (
                    <CircleNotch className="h-3.5 w-3.5 shrink-0 animate-spin text-text-secondary" weight="bold" />
                  )}
                  {doc.status === "failed" && (
                    <WarningCircle className="h-3.5 w-3.5 shrink-0 text-error" weight="fill" />
                  )}
                  <span className="shrink-0 font-sans text-xs text-text-secondary">
                    {formatRelativeDate(doc.createdAt, tRelative, locale)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
