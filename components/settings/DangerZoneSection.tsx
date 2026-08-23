// components/settings/DangerZoneSection.tsx
"use client";

import { useState } from "react";
import { Warning } from "@phosphor-icons/react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteCurrentUserAccount } from "@/lib/auth-actions";

interface DangerZoneSectionProps {
  userEmail: string;
}

export function DangerZoneSection({ userEmail }: DangerZoneSectionProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed =
    confirmText.trim().toUpperCase() === "DELETE" ||
    confirmText.trim().toLowerCase() === userEmail.toLowerCase();

  async function handleDelete() {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setError(null);
    try {
      // Server-side: deletes Blob files, Vector entries, and the User row
      // (which cascades to Documents/Conversations/Messages). See
      // lib/settings/delete-account.ts for the full sequence.
      const response = await fetch("/api/account/delete", { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");

      // Client-side: best-effort session/cookie clear now that the account
      // is already gone server-side.
      await deleteCurrentUserAccount().catch(() => {});

      // Hard navigation on purpose, not router.push() — the account no
      // longer exists, so every mounted component holding session state
      // (useSession, etc.) needs to be torn down, not just re-rendered.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/";
    } catch {
      setError("Couldn't delete your account. Try again, or contact support.");
      setIsDeleting(false);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Account</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Manage or permanently remove your account.
        </p>
      </div>

      <div className="rounded-lg border border-error/40 bg-error/5 p-5">
        <div className="flex items-start gap-3">
          <Warning size={20} className="mt-0.5 shrink-0 text-error" weight="fill" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-error">Delete account</h3>
            <p className="mt-1 text-sm text-text-secondary">
              This permanently deletes your account, documents, and conversations. This
              cannot be undone.
            </p>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => setConfirmOpen(true)}
            >
              Delete account
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmText("");
          setError(null);
        }}
        title="Delete your account"
        description={`This is permanent. Type DELETE or your email (${userEmail}) to confirm.`}
      >
        <div className="flex flex-col gap-4">
          <Input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="Type DELETE to confirm"
            autoFocus
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                setConfirmText("");
              }}
              className="text-sm text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <Button
              variant="destructive"
              disabled={!isConfirmed || isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting…" : "Permanently delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
