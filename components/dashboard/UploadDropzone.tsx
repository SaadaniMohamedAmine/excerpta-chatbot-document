// components/dashboard/UploadDropzone.tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { UploadSimple, FilePdf, FileDoc, FileCsv, FileCode, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface UploadDropzoneProps {
  variant: "empty-state" | "button";
}

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".csv",
  ".txt",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".go",
  ".rb",
  ".c",
  ".cpp",
  ".cs",
  ".php",
  ".rs",
];

/**
 * Uploads straight from the browser to Vercel Blob (Phase 2's client-upload
 * architecture — see app/api/documents/upload/route.ts's handleUpload and
 * app/api/documents/finalize/route.ts) rather than posting the file bytes to
 * our own API route: Vercel serverless functions reject request bodies over
 * 4.5MB, which a raw multipart upload of a real document would routinely hit.
 */
async function uploadWithProgress(file: File, onProgress: (pct: number) => void): Promise<{ id: string }> {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/documents/upload",
    clientPayload: JSON.stringify({ title: file.name, declaredSize: file.size }),
    onUploadProgress: (event) => {
      if (typeof event.percentage === "number") onProgress(Math.round(event.percentage));
    },
  });

  const res = await fetch("/api/documents/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileUrl: blob.url,
      pathname: blob.pathname,
      title: file.name,
      fileSize: file.size,
    }),
  });
  if (!res.ok) {
    // Surface the server's actual message (e.g. the quota-limit text) —
    // without this, res.status alone can't distinguish a quota block from
    // any other failure, and DropzoneBody has nothing useful to show.
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Upload failed (${res.status}).`);
  }
  const { document } = await res.json();
  return document;
}

function DropzoneBody({
  onFile,
  progress,
  error,
}: {
  onFile: (file: File) => void;
  progress: number | null;
  error: string | null;
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-8 py-16 text-center transition-colors ${
        dragActive ? "border-primary bg-primary/5" : "border-border bg-surface"
      }`}
    >
      <UploadSimple className="h-10 w-10 text-primary" weight="duotone" />
      <h2 className="font-sans text-base font-medium text-text-primary">Upload a document to begin.</h2>
      <p className="font-sans text-sm text-text-secondary">PDF, DOCX, CSV, or a code file.</p>

      <div className="mt-1 flex items-center gap-3 text-text-secondary">
        <FilePdf className="h-5 w-5" weight="regular" />
        <FileDoc className="h-5 w-5" weight="regular" />
        <FileCsv className="h-5 w-5" weight="regular" />
        <FileCode className="h-5 w-5" weight="regular" />
      </div>

      {progress === null ? (
        <>
          <Button className="mt-3" onClick={() => inputRef.current?.click()}>
            Browse files
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />
        </>
      ) : (
        <div className="mt-3 w-64">
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 font-sans text-xs text-text-secondary">Uploading… {progress}%</p>
        </div>
      )}

      {error && (
        <p className="font-sans text-xs text-error">
          {error}
          {error.includes("upload limit") && (
            <>
              {" "}
              <Link href="/settings?tab=billing" className="underline hover:no-underline">
                Manage your plan
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}

export default function UploadDropzone({ variant }: UploadDropzoneProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setError("This format isn't supported yet. Try PDF, DOCX, CSV, or a code file.");
        return;
      }
      setError(null);
      setProgress(0);
      try {
        const created = await uploadWithProgress(file, setProgress);
        // ?assignCollection=1 triggers CollectionAssignGate on the
        // destination page — a real upload only, never the silent demo
        // document seeded at onboarding.
        router.push(`/documents/${created.id}?assignCollection=1`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
        setProgress(null);
      }
    },
    [router]
  );

  if (variant === "empty-state") {
    return <DropzoneBody onFile={handleFile} progress={progress} error={error} />;
  }

  return (
    <>
      <Button onClick={() => setModalOpen(true)}>
        <UploadSimple className="mr-1.5 h-4 w-4" weight="bold" />
        Upload document
      </Button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-lg rounded-lg bg-surface p-2 shadow-xl">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3 rounded p-1 text-text-secondary hover:text-text-primary"
              aria-label="Close"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
            <DropzoneBody onFile={handleFile} progress={progress} error={error} />
          </div>
        </div>
      )}
    </>
  );
}
