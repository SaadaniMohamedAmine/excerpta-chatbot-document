// components/workspace/CollectionWorkspace.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SplitPane } from "@/components/layout/split-pane";
import ChatPanel from "./ChatPanel";
import ConversationHistoryList from "@/components/dashboard/ConversationHistoryList";
import { Button } from "@/components/ui/button";
import {
  FilePdf,
  FileDoc,
  FileCsv,
  FileCode,
  ClockCounterClockwise,
  Plus,
  CircleNotch,
  WarningCircle,
  Export,
  ShareNetwork,
} from "@phosphor-icons/react";
import { ExportModal } from "./ExportModal";
import { ShareModal } from "./ShareModal";
import type { ChatUIMessage } from "@/lib/chat";

const ICONS = { pdf: FilePdf, docx: FileDoc, csv: FileCsv, code: FileCode } as const;

interface CollectionDocument {
  id: string;
  title: string;
  fileType: "pdf" | "docx" | "csv" | "code";
  status: "processing" | "ready" | "failed";
}

interface CollectionData {
  id: string;
  name: string;
  documents: CollectionDocument[];
}

export default function CollectionWorkspace({ collection }: { collection: CollectionData }) {
  const tWorkspace = useTranslations("Workspace");
  const tNav = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatUIMessage[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const titleById = useCallback(
    (documentId: string) => collection.documents.find((d) => d.id === documentId)?.title,
    [collection.documents]
  );

  const startNewConversation = useCallback(async () => {
    setConversationLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionId: collection.id }),
    });
    if (!res.ok) {
      setConversationLoading(false);
      return;
    }
    const { conversation } = await res.json();
    setInitialMessages([]);
    setConversationId(conversation.id);
    setConversationLoading(false);
    setHistoryOpen(false);
  }, [collection.id]);

  const resumeConversation = useCallback(async (id: string) => {
    setConversationLoading(true);
    const res = await fetch(`/api/conversations/${id}`);
    if (!res.ok) {
      setConversationLoading(false);
      return;
    }
    const { conversation } = await res.json();
    setInitialMessages(
      (conversation.messages ?? []).map(
        (m: { id: string; role: string; content: string; citations?: ChatUIMessage["citations"] }) => ({
          id: m.id,
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
          citations: m.citations ?? undefined,
        })
      )
    );
    setConversationId(id);
    setConversationLoading(false);
    setHistoryOpen(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startNewConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection.id]);

  // The collection view has no single PDF pane to scroll within, so a
  // citation click navigates to that source document's own workspace,
  // passing the page/excerpt via query params. DocumentWorkspace reads
  // those params on mount and jumps straight to the citation — same end
  // behavior (scroll + gold highlight), via navigation instead of an
  // in-place scroll.
  const handleCitationClick = useCallback(
    (pageNumber: number, excerpt: string, documentId?: string) => {
      if (!documentId) return;
      const params = new URLSearchParams({ citePage: String(pageNumber), citeExcerpt: excerpt });
      router.push(`/documents/${documentId}?${params.toString()}`);
    },
    [router]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
        <h1 className="truncate font-sans text-sm font-medium text-text-primary">{collection.name}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setHistoryOpen((v) => !v)}>
            <ClockCounterClockwise className="mr-1.5 h-4 w-4" weight="regular" />
            {tNav("history")}
          </Button>
          <Button variant="ghost" size="sm" onClick={startNewConversation}>
            <Plus className="mr-1.5 h-4 w-4" weight="regular" />
            {tCommon("newConversation")}
          </Button>
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            disabled={!conversationId}
            aria-label={tWorkspace("shareConversation")}
            className="rounded-md p-2 text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-40"
          >
            <ShareNetwork size={18} />
          </button>
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            disabled={!conversationId}
            aria-label={tWorkspace("exportConversation")}
            className="rounded-md p-2 text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-40"
          >
            <Export size={18} />
          </button>
        </div>
      </div>

      {conversationId && (
        <>
          <ExportModal
            open={exportModalOpen}
            onClose={() => setExportModalOpen(false)}
            conversationId={conversationId}
          />
          <ShareModal
            open={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            conversationId={conversationId}
          />
        </>
      )}

      {historyOpen && (
        <ConversationHistoryList
          scope={{ kind: "collection", id: collection.id }}
          activeConversationId={conversationId}
          onSelect={resumeConversation}
        />
      )}

      <div className="min-h-0 flex-1">
        <SplitPane
          left={
            <div className="h-full overflow-y-auto bg-background">
              <ul className="divide-y divide-border">
                {collection.documents.map((doc) => {
                  const Icon = ICONS[doc.fileType] ?? FileDoc;
                  return (
                    <li key={doc.id}>
                      <a href={`/documents/${doc.id}`} className="flex items-center gap-2.5 px-4 py-3 hover:bg-surface">
                        <Icon className="h-4 w-4 shrink-0 text-primary" weight="regular" />
                        <span className="flex-1 truncate font-sans text-sm text-text-primary">{doc.title}</span>
                        {doc.status === "processing" && (
                          <CircleNotch className="h-3.5 w-3.5 animate-spin text-text-secondary" weight="bold" />
                        )}
                        {doc.status === "failed" && <WarningCircle className="h-3.5 w-3.5 text-error" weight="fill" />}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          }
          right={
            conversationLoading || !conversationId ? (
              <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                {tWorkspace("startingConversation")}
              </div>
            ) : (
              <ChatPanel
                key={conversationId}
                conversationId={conversationId}
                documentTitle={collection.name}
                suggestedQuestions={[]}
                initialMessages={initialMessages}
                onCitationClick={handleCitationClick}
                resolveDocumentTitle={titleById}
              />
            )
          }
        />
      </div>
    </div>
  );
}
