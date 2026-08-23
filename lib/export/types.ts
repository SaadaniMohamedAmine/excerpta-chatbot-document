// lib/export/types.ts
// Shared shapes for both generators, kept in their own file so
// lib/export/docx.ts never has to import anything from pdfkit.

// Matches exactly what /api/chat persists on Message.citations (Phase 2) —
// no `documentTitle` field exists there, and `pageNumber` can be null (it
// only fails to resolve if a chunk had neither a page nor a line/row range).
export interface Citation {
  documentId: string;
  pageNumber: number | null;
  excerpt: string;
}

export interface ExportMessage {
  id: string;
  role: string; // "user" | "assistant"
  content: string;
  citations: Citation[] | null;
  createdAt: Date;
}

export interface ExportConversation {
  id: string;
  /** Resolved by the caller: the document's title, or a collection's name,
   *  or a fallback string. Callers do the title resolution (they're the
   *  ones with DB access) so the generators stay pure and easy to test. */
  title: string;
  messages: ExportMessage[];
}
