// app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Warning } from "@phosphor-icons/react";
import { useSession } from "@/lib/auth-client";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("Error");
  const tNotFound = useTranslations("NotFound");
  const { data: session } = useSession();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <SiteNav />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="relative flex h-20 w-20 items-center justify-center">
          <span aria-hidden="true" className="absolute inset-0 animate-pulse rounded-full bg-error/20 blur-2xl" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-error to-error/70 text-white shadow-lg shadow-error/40">
            <Warning size={30} weight="duotone" />
          </span>
        </span>

        <h1 className="mt-6 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="mt-3 max-w-sm font-sans text-sm text-text-secondary">{t("subtitle")}</p>

        <div className="mt-8 flex items-center gap-3">
          <Button size="lg" onClick={reset}>
            {t("tryAgain")}
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href={session?.user ? "/documents" : "/"}>
              {session?.user ? tNotFound("backToDocuments") : tNotFound("backToHome")}
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
