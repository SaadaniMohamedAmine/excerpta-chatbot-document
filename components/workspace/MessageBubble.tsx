// components/workspace/MessageBubble.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatUIMessage } from "@/lib/chat";
import { CitationTag } from "@/components/ui/citation-tag";

interface MessageBubbleProps {
  message: ChatUIMessage;
  onCitationClick?: (pageNumber: number, excerpt: string, documentId?: string) => void;
  resolveDocumentTitle?: (documentId: string) => string | undefined;
  /** Renders citations as inert reference tags instead of clickable
   *  scroll-to-source buttons — used on the public /share/[token] page,
   *  which has no document viewer to jump to. */
  readOnly?: boolean;
}

function MessageBubble({ message, onCitationClick, resolveDocumentTitle, readOnly = false }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const citations = isUser ? [] : (message.citations ?? []);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-lg bg-primary px-3.5 py-2.5 text-white"
            : "max-w-[85%] rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text-primary"
        }
      >
        <div
          className="font-sans text-sm leading-relaxed
            [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0
            [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5
            [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5
            [&_code]:rounded [&_code]:bg-background/50 [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs
            [&_a]:underline"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
        {citations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/50 pt-2">
            {citations.map((citation, i) => (
              <CitationTag
                key={`${citation.documentId}-${citation.pageNumber}-${i}`}
                page={citation.pageNumber ?? undefined}
                documentTitle={citation.documentTitle ?? resolveDocumentTitle?.(citation.documentId)}
                onClick={
                  readOnly
                    ? undefined
                    : () =>
                        citation.pageNumber != null &&
                        onCitationClick?.(citation.pageNumber, citation.excerpt, citation.documentId)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
export { MessageBubble };
