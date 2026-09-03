// components/command-palette/CommandPalette.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import {
  FileText,
  FolderStar,
  Gear,
  ClockCounterClockwise,
  Plus,
  Moon,
  Sun,
  MagicWand,
  SignOut,
  FilePdf,
  FileDoc,
  FileCsv,
  FileCode,
} from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";

interface DocumentResult {
  id: string;
  title: string;
  fileType: "pdf" | "docx" | "csv" | "code";
}

const FILE_ICONS = { pdf: FilePdf, docx: FileDoc, csv: FileCsv, code: FileCode } as const;

export function CommandPalette() {
  const t = useTranslations("CommandPalette");
  const tNav = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentResult[]>([]);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    function handleOpenEvent() {
      setOpen(true);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("excerpta:open-command-palette", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("excerpta:open-command-palette", handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    fetch("/api/documents")
      .then((res) => (res.ok ? res.json() : []))
      .then((docs: DocumentResult[]) => setDocuments(docs))
      .catch(() => setDocuments([]));
  }, [open]);

  function go(href: string) {
    router.push(href);
    setOpen(false);
  }

  async function handleSignOut() {
    await authClient.signOut();
    setOpen(false);
    router.push("/sign-in");
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label={t("label")}
      // cmdk's generic `className` prop lands on the inner Command root, not
      // the positioned dialog box (confirmed against the installed 1.x
      // source) — contentClassName/overlayClassName are the real hooks.
      overlayClassName="fixed inset-0 z-[9999] bg-black/50"
      contentClassName="fixed left-1/2 top-24 z-[10000] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-surface shadow-2xl"
      // cmdk doesn't expose a className prop on the group heading element
      // itself — style it via its [cmdk-group-heading] attribute hook instead.
      className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-sans [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-text-secondary"
    >
      <div className="flex items-center border-b border-border px-3">
        <Command.Input
          placeholder={t("searchPlaceholder")}
          className="h-11 w-full bg-transparent font-sans text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
        />
      </div>
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="py-6 text-center font-sans text-sm text-text-secondary">
          {t("noResults")}
        </Command.Empty>

        <Command.Group heading={t("groupNavigation")}>
          <PaletteItem icon={FileText} label={tNav("documents")} onSelect={() => go("/documents")} />
          <PaletteItem icon={FolderStar} label={tNav("collections")} onSelect={() => go("/collections")} />
          <PaletteItem icon={ClockCounterClockwise} label={tNav("history")} onSelect={() => go("/history")} />
          <PaletteItem icon={Gear} label={tNav("settings")} onSelect={() => go("/settings")} />
        </Command.Group>

        {documents.length > 0 && (
          <Command.Group heading={t("groupDocuments")}>
            {documents.map((doc) => (
              <PaletteItem
                key={doc.id}
                icon={FILE_ICONS[doc.fileType] ?? FileText}
                label={doc.title}
                onSelect={() => go(`/documents/${doc.id}`)}
              />
            ))}
          </Command.Group>
        )}

        <Command.Group heading={t("groupActions")}>
          <PaletteItem icon={Plus} label={tNav("newDocument")} onSelect={() => go("/documents")} />
          <PaletteItem
            icon={resolvedTheme === "dark" ? Sun : Moon}
            label={resolvedTheme === "dark" ? t("switchToLight") : t("switchToDark")}
            onSelect={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
              setOpen(false);
            }}
          />
          <PaletteItem icon={MagicWand} label={t("replayTour")} onSelect={() => go("/documents?tour=1")} />
          <PaletteItem icon={SignOut} label={tNav("signOut")} onSelect={handleSignOut} destructive />
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

function PaletteItem({
  icon: Icon,
  label,
  onSelect,
  destructive = false,
}: {
  icon: React.ElementType;
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 font-sans text-sm outline-none transition-colors data-[selected=true]:bg-background ${
        destructive ? "text-error" : "text-text-primary"
      }`}
    >
      <Icon size={16} weight="regular" />
      {label}
    </Command.Item>
  );
}
