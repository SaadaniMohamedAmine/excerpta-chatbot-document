// lib/documents/extract-text.ts
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import Papa from "papaparse";
import hljs from "highlight.js";

export type ExtractedPage = { pageNumber: number; text: string };

export type PdfExtraction = { pages: ExtractedPage[]; pageCount: number };
export type DocxExtraction = { pages: ExtractedPage[]; pageCount: null };
export type CsvRow = { rowNumber: number; text: string };
export type CsvExtraction = { rows: CsvRow[]; headers: string[] };
export type CodeLine = { lineNumber: number; text: string };
export type CodeExtraction = { lines: CodeLine[]; language: string };

export type ExtractedDocument =
  | { kind: "pdf"; data: PdfExtraction }
  | { kind: "docx"; data: DocxExtraction }
  | { kind: "csv"; data: CsvExtraction }
  | { kind: "code"; data: CodeExtraction };

/**
 * PDF extraction, PER PAGE. pdf-parse v2 rewrote its API around a `PDFParse`
 * class (the old v1 default-export function + `pagerender` hook override no
 * longer exists) — `getText()` returns per-page text natively, so no hook
 * override is needed at all.
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfExtraction> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const pages: ExtractedPage[] = result.pages.map((p) => ({ pageNumber: p.num, text: p.text }));
    return { pages, pageCount: result.total };
  } finally {
    await parser.destroy();
  }
}

/**
 * DOCX has no reliable, renderer-independent concept of "page" (pagination
 * depends on viewer/print settings) — mammoth extracts raw text as a single
 * flowing document. We represent it as one page (pageNumber = 1); citations
 * for DOCX documents will all say "Page 1" — the frontend should render DOCX
 * citations without a page number, or as "the document" rather than a page.
 */
export async function extractDocxText(buffer: Buffer): Promise<DocxExtraction> {
  const result = await mammoth.extractRawText({ buffer });
  return { pages: [{ pageNumber: 1, text: result.value }], pageCount: null };
}

export async function extractCsvText(buffer: Buffer): Promise<CsvExtraction> {
  const csvString = buffer.toString("utf-8");
  const parsed = Papa.parse<Record<string, string>>(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  const headers = parsed.meta.fields ?? [];
  const rows: CsvRow[] = parsed.data.map((row, index) => ({
    rowNumber: index + 1,
    text: headers.map((h) => `${h}: ${row[h] ?? ""}`).join(", "),
  }));

  return { rows, headers };
}

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  java: "java",
  go: "go",
  rb: "ruby",
  rs: "rust",
  c: "c",
  cpp: "cpp",
  h: "cpp",
  cs: "csharp",
  php: "php",
  sql: "sql",
  sh: "bash",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  txt: "plaintext",
};

export function extractCodeText(buffer: Buffer, filename: string): CodeExtraction {
  const content = buffer.toString("utf-8");
  const lines: CodeLine[] = content.split("\n").map((text, index) => ({
    lineNumber: index + 1,
    text,
  }));

  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  let language = EXTENSION_TO_LANGUAGE[extension];

  if (!language) {
    // Unknown extension — fall back to highlight.js auto-detection on a sample.
    const sample = content.slice(0, 2000);
    const detected = hljs.highlightAuto(sample);
    language = detected.language ?? "plaintext";
  }

  return { lines, language };
}

/** Dispatcher — routes to the right extractor based on Document.fileType. */
export async function extractText(
  buffer: Buffer,
  fileType: "pdf" | "docx" | "csv" | "code",
  filename: string
): Promise<ExtractedDocument> {
  switch (fileType) {
    case "pdf":
      return { kind: "pdf", data: await extractPdfText(buffer) };
    case "docx":
      return { kind: "docx", data: await extractDocxText(buffer) };
    case "csv":
      return { kind: "csv", data: await extractCsvText(buffer) };
    case "code":
      return { kind: "code", data: extractCodeText(buffer, filename) };
    default: {
      const _exhaustive: never = fileType;
      throw new Error(`Unsupported file type: ${_exhaustive}`);
    }
  }
}
