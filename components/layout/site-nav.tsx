// components/layout/site-nav.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authClient, useSession } from "@/lib/auth-client";
import { NAV_LINKS } from "@/components/layout/nav-links";

function AuthActions() {
  const tNav = useTranslations("Nav");
  const tLanding = useTranslations("Landing");
  const tAuth = useTranslations("Auth");
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="h-8 w-[168px]" aria-hidden="true" />;
  }

  if (session?.user) {
    return (
      <>
        <button
          type="button"
          onClick={async () => {
            await authClient.signOut();
            router.push("/");
            router.refresh();
          }}
          className="hidden text-sm text-text-secondary transition-colors hover:text-text-primary sm:inline"
        >
          {tNav("signOut")}
        </button>
        <Button asChild size="sm">
          <Link href="/documents">{tLanding("hero.ctaSignedIn")}</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/sign-in"
        className="hidden text-sm text-text-secondary transition-colors hover:text-text-primary sm:inline"
      >
        {tAuth("signIn")}
      </Link>
      <Button asChild size="sm">
        <Link href="/sign-up">{tLanding("hero.ctaSignedOut")}</Link>
      </Button>
    </>
  );
}

export function SiteNav() {
  const t = useTranslations("Landing.nav");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href="/" />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AuthActions />
        </div>
      </div>
    </header>
  );
}
