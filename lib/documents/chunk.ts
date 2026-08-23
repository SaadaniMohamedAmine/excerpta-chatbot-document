// lib/documents/chunk.ts
import { RecursiveCharacterTextSplitter, type SupportedTextSplitterLanguage } from "@langchain/textsplitters";
import type { PdfExtraction, DocxExtraction, CsvRow, CodeLine, ExtractedDocument } from "./extract-text";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

/**
 * What we store per chunk, and why: PDF chunks carry `pageNumber` (the whole
 * point of per-page extraction in extract-text.ts). CSV has no "page" concept,
 * so we store a `rowRange` (e.g. "101-150") instead — clicking a CSV citation
 * scrolls/highlights that row range in a table view. Code files similarly have
 * no pages, so we store a `lineRange` (e.g. "12-40") — clicking scrolls/
 * highlights those lines in a code viewer. Exactly one of pageNumber/lineRange/
 * rowRange is non-null for any given chunk (DOCX chunks get pageNumber = 1,
 * per the extract-text.ts note on DOCX pagination).
 */
export type DocumentChunk = {
  content: string;
  pageNumber: number | null;
  lineRange: string | null;
  rowRange: string | null;
};

const defaultSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: CHUNK_SIZE,
  chunkOverlap: CHUNK_OVERLAP,
});

export async function chunkPdf(extracted: PdfExtraction): Promise<DocumentChunk[]> {
  const chunks: DocumentChunk[] = [];
  // Split PAGE BY PAGE, not the whole concatenated document — splitting per
  // page is what keeps every resulting chunk attributable to exactly one page
  // number instead of blurring across a page boundary.
  for (const page of extracted.pages) {
    if (!page.text.trim()) continue;
    const pieces = await defaultSplitter.splitText(page.text);
    for (const piece of pieces) {
      chunks.push({ content: piece, pageNumber: page.pageNumber, lineRange: null, rowRange: null });
    }
  }
  return chunks;
}

export async function chunkDocx(extracted: DocxExtraction): Promise<DocumentChunk[]> {
  const fullText = extracted.pages[0]?.text ?? "";
  const pieces = await defaultSplitter.splitText(fullText);
  return pieces.map((piece) => ({ content: piece, pageNumber: 1, lineRange: null, rowRange: null }));
}

const CSV_ROW_CHAR_BUDGET = 1000;

/**
 * CSV rows are typically short — rather than running the character splitter
 * over the whole flattened CSV text (which would produce chunk boundaries
 * that cut a row in half), we greedily pack whole rows into a chunk until
 * adding the next row would exceed CSV_ROW_CHAR_BUDGET, then start a new
 * chunk. This keeps every chunk a whole number of rows, so rowRange is exact.
 */
export function chunkCsv(rows: CsvRow[], headers: string[]): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const headerLine = headers.join(", ");
  let currentRows: CsvRow[] = [];
  let currentLength = 0;

  const flush = () => {
    if (currentRows.length === 0) return;
    const start = currentRows[0].rowNumber;
    const end = currentRows[currentRows.length - 1].rowNumber;
    const content = `Columns: ${headerLine}\n` + currentRows.map((r) => r.text).join("\n");
    chunks.push({ content, pageNumber: null, lineRange: null, rowRange: `${start}-${end}` });
    currentRows = [];
    currentLength = 0;
  };

  for (const row of rows) {
    if (currentLength + row.text.length > CSV_ROW_CHAR_BUDGET && currentRows.length > 0) {
      flush();
    }
    currentRows.push(row);
    currentLength += row.text.length;
  }
  flush();

  return chunks;
}

// LangChain's language-aware separator sets (RecursiveCharacterTextSplitter.
// fromLanguage) only cover a fixed language list, and its tag names don't
// always match ours (e.g. it's "js", not "javascript"). Map our detected
// language onto LangChain's tag where one exists; otherwise fall back to the
// default character splitter (still correct, just without language-aware
// split points like function/class boundaries).
// Verified against the installed @langchain/textsplitters' actual
// SupportedTextSplitterLanguages list (cpp, go, java, js, php, proto, python,
// rst, ruby, rust, scala, swift, markdown, latex, html, sol) — csharp isn't
// in it, so it's deliberately omitted rather than mapped to a value that
// would throw at runtime.
const LANGCHAIN_LANGUAGE_MAP: Record<string, SupportedTextSplitterLanguage> = {
  javascript: "js",
  typescript: "js",
  python: "python",
  java: "java",
  go: "go",
  ruby: "ruby",
  rust: "rust",
  cpp: "cpp",
  c: "cpp",
  php: "php",
  markdown: "markdown",
};

/**
 * Any language not in the map above (or that throws when passed to
 * `fromLanguage`) safely falls back to the default splitter, so a stale
 * mapping degrades chunk quality, it doesn't break.
 */
export async function chunkCode(lines: CodeLine[], language: string): Promise<DocumentChunk[]> {
  const fullText = lines.map((l) => l.text).join("\n");

  const mappedLanguage = LANGCHAIN_LANGUAGE_MAP[language];
  let splitter: RecursiveCharacterTextSplitter = defaultSplitter;
  if (mappedLanguage) {
    try {
      splitter = RecursiveCharacterTextSplitter.fromLanguage(mappedLanguage, {
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
      });
    } catch {
      splitter = defaultSplitter;
    }
  }

  // Precompute each line's starting character offset in fullText, so we can
  // map a chunk's character position back to an exact 1-indexed line number.
  const lineStartOffsets: number[] = [];
  {
    let offset = 0;
    for (const line of lines) {
      lineStartOffsets.push(offset);
      offset += line.text.length + 1; // +1 for the '\n' used to join lines above
    }
  }

  function lineNumberForOffset(charOffset: number): number {
    let lo = 0;
    let hi = lineStartOffsets.length - 1;
    let result = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (lineStartOffsets[mid] <= charOffset) {
        result = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return result + 1; // 1-indexed
  }

  const pieces = await splitter.splitText(fullText);
  const chunks: DocumentChunk[] = [];
  let searchCursor = 0;

  for (const piece of pieces) {
    // Search from just before where we expect this piece (allowing for the
    // configured overlap), so identical repeated lines resolve in document order.
    const searchFrom = Math.max(0, searchCursor - CHUNK_OVERLAP);
    const foundAt = fullText.indexOf(piece, searchFrom);
    const startOffset = foundAt === -1 ? searchCursor : foundAt;
    const endOffset = startOffset + piece.length;

    const startLine = lineNumberForOffset(startOffset);
    const endLine = lineNumberForOffset(Math.max(startOffset, endOffset - 1));

    chunks.push({
      content: piece,
      pageNumber: null,
      lineRange: `${startLine}-${endLine}`,
      rowRange: null,
    });

    searchCursor = endOffset;
  }

  return chunks;
}

export type FileType = "pdf" | "docx" | "csv" | "code";

/** Dispatcher — routes to the right chunker based on the extraction result's kind. */
export async function chunkDocument(fileType: FileType, extracted: ExtractedDocument): Promise<DocumentChunk[]> {
  switch (extracted.kind) {
    case "pdf":
      return chunkPdf(extracted.data);
    case "docx":
      return chunkDocx(extracted.data);
    case "csv":
      return chunkCsv(extracted.data.rows, extracted.data.headers);
    case "code":
      return chunkCode(extracted.data.lines, extracted.data.language);
  }
}
