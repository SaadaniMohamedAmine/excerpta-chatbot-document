// components/workspace/CodeViewer.tsx
"use client";

import { useEffect, useState } from "react";
import hljs from "highlight.js";
import { CircleNotch } from "@phosphor-icons/react";
import type { ActiveCitation } from "./DocumentWorkspace";
import styles from "./CodeViewer.module.css";

interface CodeViewerProps {
  fileUrl: string;
  title: string;
  activeCitation: ActiveCitation | null;
}

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  rb: "ruby",
  java: "java",
  kt: "kotlin",
  go: "go",
  rs: "rust",
  c: "c",
  h: "c",
  cpp: "cpp",
  hpp: "cpp",
  cs: "csharp",
  php: "php",
  swift: "swift",
  sh: "bash",
  bash: "bash",
  sql: "sql",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  css: "css",
  scss: "scss",
  html: "xml",
  xml: "xml",
  md: "markdown",
};

function detectLanguage(fileNameOrUrl: string): string {
  const clean = fileNameOrUrl.split("?")[0].split("#")[0];
  const ext = clean.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_LANGUAGE[ext] ?? "plaintext";
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Each line is highlighted INDEPENDENTLY (hljs.highlight(line, {language})),
 * rather than highlighting the whole file once and splitting the resulting
 * HTML on "\n". Per-line highlighting can never produce mismatched/unclosed
 * <span> tags across line boundaries. Tradeoff: syntax state does not carry
 * across lines (a multi-line comment/string highlights as if starting fresh
 * on each line) — cosmetic only, citation highlighting uses line numbers,
 * not token boundaries.
 */
function highlightLine(line: string, language: string): string {
  if (language === "plaintext") return escapeHtml(line);
  try {
    return hljs.highlight(line, { language, ignoreIllegals: true }).value;
  } catch {
    return escapeHtml(line);
  }
}

export default function CodeViewer({ fileUrl, title, activeCitation }: CodeViewerProps) {
  const [lines, setLines] = useState<string[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error("failed to fetch");
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setLines(text.split(/\r\n|\r|\n/));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!activeCitation) return;
    const el = document.getElementById(`code-line-${activeCitation.pageNumber}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeCitation, lines]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-background text-sm text-error">
        Couldn&apos;t load this file.
      </div>
    );
  }

  if (!lines) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <CircleNotch className="h-6 w-6 animate-spin text-primary" weight="bold" />
      </div>
    );
  }

  const language = detectLanguage(title || fileUrl);

  return (
    <div className={`h-full overflow-auto bg-background ${styles.codeViewer}`}>
      <table className="w-full border-collapse font-mono text-sm">
        <tbody>
          {lines.map((line, i) => {
            const lineNumber = i + 1;
            const isCited = activeCitation?.pageNumber === lineNumber;
            return (
              <tr key={i} id={`code-line-${lineNumber}`} className={isCited ? "bg-gold/30" : undefined}>
                <td className="select-none border-r border-border px-3 py-0.5 text-right text-xs text-text-secondary">
                  {lineNumber}
                </td>
                <td
                  className="whitespace-pre px-3 py-0.5 text-text-primary"
                  dangerouslySetInnerHTML={{ __html: highlightLine(line, language) || "&nbsp;" }}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
