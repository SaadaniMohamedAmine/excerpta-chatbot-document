// lib/documents/constraints.ts

/** file extension (lowercase, no dot) -> Document.fileType value */
export const ALLOWED_EXTENSIONS: Record<string, "pdf" | "docx" | "csv" | "code"> = {
  pdf: "pdf",
  docx: "docx",
  csv: "csv",
  // "code" covers plain text and every common source-code extension.
  txt: "code",
  js: "code",
  jsx: "code",
  ts: "code",
  tsx: "code",
  py: "code",
  java: "code",
  go: "code",
  rb: "code",
  rs: "code",
  c: "code",
  cpp: "code",
  h: "code",
  cs: "code",
  php: "code",
  sql: "code",
  sh: "code",
  json: "code",
  yaml: "code",
  yml: "code",
  md: "code",
};

export const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
  "text/plain",
  // Browsers frequently send this generic type for source-code files with no
  // registered MIME type (e.g. .py, .rs) — allow it and rely on the extension
  // allow-list above for the actual type decision.
  "application/octet-stream",
];

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB — comfortably inside every free-tier ceiling in this stack
