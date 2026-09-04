// app/not-found.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Compass } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <SiteNav />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="relative flex h-20 w-20 items-center justify-center">
          <span aria-hidden="true" className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg shadow-primary/40">
            <Compass size={30} weight="duotone" />
          </span>
        </span>

        <p className="mt-6 font-serif text-6xl font-semibold tracking-tight text-primary">404</p>
        <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="mt-3 max-w-sm font-sans text-sm text-text-secondary">{t("subtitle")}</p>

        <Button asChild size="lg" className="mt-8">
          <Link href={session?.user ? "/documents" : "/"}>
            {session?.user ? t("backToDocuments") : t("backToHome")}
          </Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
