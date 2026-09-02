// components/layout/site-footer.tsx
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/ui/logo";
import { NAV_LINKS } from "@/components/layout/nav-links";

export function SiteFooter() {
  const t = useTranslations("Landing.nav");

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-sm text-text-secondary sm:flex-row sm:justify-between sm:px-6">
        <Logo href="/" />
        <div className="flex flex-wrap items-center justify-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-text-primary">
              {t(link.key)}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
