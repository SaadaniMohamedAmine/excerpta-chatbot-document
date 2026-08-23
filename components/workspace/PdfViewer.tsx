// components/workspace/PdfViewer.tsx
"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  CaretLeft,
  CaretRight,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  CircleNotch,
} from "@phosphor-icons/react";
import CitationHighlightOverlay from "./CitationHighlightOverlay";
import type { ActiveCitation } from "./DocumentWorkspace";

// Bundler-relative worker import (react-pdf's current recommended setup) —
// avoids depending on an external CDN (unpkg) to serve a script that runs
// inside an authenticated app.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.2;

export interface PdfViewerHandle {
  scrollToPage: (pageNumber: number) => void;
}

interface PdfViewerProps {
  fileUrl: string;
  activeCitation: ActiveCitation | null;
}

const PdfViewer = forwardRef<PdfViewerHandle, PdfViewerProps>(function PdfViewer(
  { fileUrl, activeCitation },
  ref
) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const paneRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      scrollToPage: (pageNumber: number) => {
        setCurrentPage(() => {
          const clamped = numPages ? Math.min(Math.max(pageNumber, 1), numPages) : pageNumber;
          setPageInput(String(clamped));
          return clamped;
        });
        paneRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      },
    }),
    [numPages]
  );

  useEffect(() => {
    if (activeCitation) {
      setCurrentPage(activeCitation.pageNumber);
      setPageInput(String(activeCitation.pageNumber));
    }
  }, [activeCitation]);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
  }, []);

  const goToPage = (n: number) => {
    if (!numPages) return;
    const clamped = Math.min(Math.max(n, 1), numPages);
    setCurrentPage(clamped);
    setPageInput(String(clamped));
  };

  const handlePageInputCommit = () => {
    const n = parseInt(pageInput, 10);
    if (!Number.isNaN(n)) goToPage(n);
    else setPageInput(String(currentPage));
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded p-1.5 text-text-secondary hover:bg-gold/10 hover:text-text-primary disabled:opacity-30"
            aria-label="Previous page"
          >
            <CaretLeft className="h-4 w-4" weight="bold" />
          </button>
          <div className="flex items-center gap-1 font-sans text-sm text-text-primary">
            <span>Page</span>
            <input
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageInputCommit}
              onKeyDown={(e) => e.key === "Enter" && handlePageInputCommit()}
              className="w-10 rounded border border-border bg-background px-1 py-0.5 text-center text-sm"
              aria-label="Page number"
            />
            <span>of {numPages ?? "…"}</span>
          </div>
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={!numPages || currentPage >= numPages}
            className="rounded p-1.5 text-text-secondary hover:bg-gold/10 hover:text-text-primary disabled:opacity-30"
            aria-label="Next page"
          >
            <CaretRight className="h-4 w-4" weight="bold" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)))}
            disabled={scale <= MIN_SCALE}
            className="rounded p-1.5 text-text-secondary hover:bg-gold/10 hover:text-text-primary disabled:opacity-30"
            aria-label="Zoom out"
          >
            <MagnifyingGlassMinus className="h-4 w-4" weight="regular" />
          </button>
          <span className="w-10 text-center font-mono text-xs text-text-secondary">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)))}
            disabled={scale >= MAX_SCALE}
            className="rounded p-1.5 text-text-secondary hover:bg-gold/10 hover:text-text-primary disabled:opacity-30"
            aria-label="Zoom in"
          >
            <MagnifyingGlassPlus className="h-4 w-4" weight="regular" />
          </button>
        </div>
      </div>

      <div ref={paneRef} className="flex-1 overflow-auto">
        <div className="relative mx-auto my-4 w-fit">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex h-96 w-96 items-center justify-center">
                <CircleNotch className="h-6 w-6 animate-spin text-primary" weight="bold" />
              </div>
            }
            error={
              <div className="flex h-96 w-96 items-center justify-center text-sm text-error">
                Couldn&apos;t load this PDF.
              </div>
            }
          >
            <div className="relative" id={`pdf-page-container-${currentPage}`}>
              <Page key={currentPage} pageNumber={currentPage} scale={scale} renderAnnotationLayer renderTextLayer />
              <CitationHighlightOverlay
                containerSelector={`#pdf-page-container-${currentPage} .react-pdf__Page__textContent`}
                excerpt={activeCitation && activeCitation.pageNumber === currentPage ? activeCitation.excerpt : null}
                dependencyKey={`${currentPage}-${scale}-${activeCitation?.excerpt ?? ""}`}
              />
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
});

export default PdfViewer;
