// components/workspace/DocumentWorkspace.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SplitPane } from "@/components/layout/split-pane";
import PdfViewer, { type PdfViewerHandle } from "./PdfViewer";
import CsvViewer from "./CsvViewer";
import CodeViewer from "./CodeViewer";
import ChatPanel from "./ChatPanel";
import ProcessingPanel from "./ProcessingPanel";
import ErrorPanel from "./ErrorPanel";
import ConversationHistoryList from "@/components/dashboard/ConversationHistoryList";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ClockCounterClockwise,
  Plus,
  Export,
  ShareNetwork,
  FilePdf,
  FileDoc,
  FileCsv,
  FileCode,
} from "@phosphor-icons/react";
import { ExportModal } from "./ExportModal";
import { ShareModal } from "./ShareModal";
import { WorkspaceTour } from "@/components/onboarding/WorkspaceTour";
import type { ChatUIMessage } from "@/lib/chat";

export interface WorkspaceDocument {
  id: string;
  title: string;
  fileType: "pdf" | "docx" | "csv" | "code";
  fileUrl: string;
  fileSize: number;
  pageCount: number | null;
  status: "processing" | "ready" | "failed";
  createdAt: string;
  suggestedQuestions?: string[];
}

const FILE_ICONS = { pdf: FilePdf, docx: FileDoc, csv: FileCsv, code: FileCode } as const;

export interface ActiveCitation {
  pageNumber: number;
  excerpt: string;
  documentId?: string;
}

export default function DocumentWorkspace({ document }: { document: WorkspaceDocument }) {
  const searchParams = useSearchParams();
  const initialCitePage = searchParams.get("citePage");
  const initialCiteExcerpt = searchParams.get("citeExcerpt");

  const [activeCitation, setActiveCitation] = useState<ActiveCitation | null>(
    initialCitePage
      ? {
          pageNumber: parseInt(initialCitePage, 10),
          excerpt: initialCiteExcerpt ?? "",
          documentId: document.id,
        }
      : null
  );
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatUIMessage[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(true);
  const pdfViewerRef = useRef<PdfViewerHandle>(null);

  const startNewConversation = useCallback(async () => {
    setConversationLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: document.id }),
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
  }, [document.id]);

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

  // On first mount, start a fresh conversation. To auto-resume the most
  // recent one instead, call GET /api/documents/:id/conversations here and
  // pass its newest id into resumeConversation().
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startNewConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.id]);

  const handleCitationClick = useCallback(
    (pageNumber: number, excerpt: string, documentId?: string) => {
      setActiveCitation({ pageNumber, excerpt, documentId: documentId ?? document.id });
      pdfViewerRef.current?.scrollToPage(pageNumber);
    },
    [document.id]
  );

  if (document.status === "processing") {
    return <ProcessingPanel documentId={document.id} />;
  }

  if (document.status === "failed") {
    return <ErrorPanel documentId={document.id} />;
  }

  const DocIcon = FILE_ICONS[document.fileType] ?? FileDoc;

  const viewer =
    document.fileType === "csv" ? (
      <CsvViewer fileUrl={document.fileUrl} activeCitation={activeCitation} />
    ) : document.fileType === "code" ? (
      <CodeViewer fileUrl={document.fileUrl} title={document.title} activeCitation={activeCitation} />
    ) : (
      // pdf AND docx (docx assumed pre-converted to a PDF rendering upstream
      // — no dedicated DocxViewer exists).
      <PdfViewer ref={pdfViewerRef} fileUrl={document.fileUrl} activeCitation={activeCitation} />
    );

  return (
    <div className="flex h-full flex-col bg-background p-4">
      <WorkspaceTour />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm shadow-primary/30">
              <DocIcon size={16} weight="duotone" />
            </span>
            <h1 className="truncate font-sans text-sm font-medium text-text-primary">{document.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={startNewConversation}>
              <Plus className="mr-1.5 h-4 w-4" weight="bold" />
              New conversation
            </Button>
            <div className="flex items-center gap-1 rounded-full border border-border bg-background px-1 py-1 shadow-sm">
              <button
                type="button"
                onClick={() => setHistoryOpen((v) => !v)}
                aria-label="Conversation history"
                title="History"
                className={cn(
                  "rounded-full p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary",
                  historyOpen && "bg-primary/10 text-primary"
                )}
              >
                <ClockCounterClockwise size={18} weight="duotone" />
              </button>
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                disabled={!conversationId}
                aria-label="Share conversation"
                title="Share"
                className="rounded-full p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
              >
                <ShareNetwork size={18} weight="duotone" />
              </button>
              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                disabled={!conversationId}
                aria-label="Export conversation"
                title="Export"
                className="rounded-full p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
              >
                <Export size={18} weight="duotone" />
              </button>
            </div>
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
            scope={{ kind: "document", id: document.id }}
            activeConversationId={conversationId}
            onSelect={resumeConversation}
          />
        )}

        <div className="min-h-0 flex-1">
          <SplitPane
            left={viewer}
            right={
              conversationLoading || !conversationId ? (
                <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                  Starting conversation…
                </div>
              ) : (
                <ChatPanel
                  key={conversationId}
                  conversationId={conversationId}
                  documentTitle={document.title}
                  suggestedQuestions={document.suggestedQuestions ?? []}
                  initialMessages={initialMessages}
                  onCitationClick={handleCitationClick}
                />
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
