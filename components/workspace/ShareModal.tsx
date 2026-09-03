// components/workspace/ShareModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, LinkBreak } from "@phosphor-icons/react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
}

export function ShareModal({ open, onClose, conversationId }: ShareModalProps) {
  const t = useTranslations("ShareModal");
  const tWorkspace = useTranslations("Workspace");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && !isShared && !shareUrl) {
      void createShareLink();
    }
    // Intentionally only re-runs when the modal opens/closes — creating the
    // link is idempotent (the API route reuses an existing token), so this
    // is safe even if the modal is opened multiple times per session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function createShareLink() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/share`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to create share link");
      const data = await response.json();
      setShareUrl(data.url);
      setIsShared(true);
    } catch {
      setError(t("createFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  async function revokeShareLink() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/share`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to revoke share link");
      setIsShared(false);
      setCopied(false);
    } catch {
      setError(t("revokeFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t("copyFailed"));
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tWorkspace("shareConversation")}
      description={t("description")}
    >
      <div className="flex flex-col gap-4">
        {isShared && shareUrl ? (
          <>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-text-primary"
              />
              <Button onClick={handleCopy} variant="secondary">
                {copied ? (
                  <Check size={16} className="mr-1.5" />
                ) : (
                  <Copy size={16} className="mr-1.5" />
                )}
                {copied ? t("copied") : t("copyLink")}
              </Button>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="text-xs text-text-secondary">{t("revokeHint")}</p>
              <button
                type="button"
                onClick={revokeShareLink}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-sm text-error hover:underline"
              >
                <LinkBreak size={14} />
                {t("revoke")}
              </button>
            </div>
          </>
        ) : (
          <>
            {error && <p className="text-sm text-error">{error}</p>}
            <Button onClick={createShareLink} disabled={isLoading}>
              {isLoading ? t("creatingLink") : t("createLink")}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
