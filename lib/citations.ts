// lib/citations.ts
//
// The workspace delegation file assumed citations arrive via ai/react's
// useChat message `annotations` channel. Our real /api/chat (Phase 2)
// streams plain text and persists citations to Message.citations instead —
// see lib/chat.ts's useDocumentChat, which refetches them once the stream
// finishes. This file only keeps the shared Citation type and the fuzzy
// text-match helper used by CitationHighlightOverlay.

export interface Citation {
  documentId: string;
  pageNumber: number | null;
  excerpt: string;
  documentTitle?: string;
}

export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    // Rejoins a word split across a PDF line wrap ("extra-\npolate") — the
    // excerpt (from pdf-parse) and the rendered text layer (from pdf.js) can
    // disagree on where exactly that hyphen/space landed, which otherwise
    // breaks the exact-substring match in CitationHighlightOverlay.
    .replace(/(\w)-\s+(\w)/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}
