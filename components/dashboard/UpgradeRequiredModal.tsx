// components/dashboard/UpgradeRequiredModal.tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Rocket } from "@phosphor-icons/react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";

export function UpgradeRequiredModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("UploadDropzone");

  return (
    <Modal open={open} onClose={onClose} title={t("upgradeRequiredTitle")} description={t("quotaExceeded")}>
      <div className="flex flex-col items-center gap-5 py-2 text-center">
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-pulse rounded-full bg-primary/30 blur-xl"
          />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg shadow-primary/40">
            <Rocket size={26} weight="fill" />
          </span>
        </span>
        <Button asChild size="lg" className="w-full">
          <Link href="/settings?tab=billing">{t("upgradeNow")}</Link>
        </Button>
      </div>
    </Modal>
  );
}
