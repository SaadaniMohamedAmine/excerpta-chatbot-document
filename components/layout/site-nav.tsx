// components/layout/site-nav.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#whats-new", label: "What's new" },
  { href: "/#how-it-works", label: "How it works" },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href="/" />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="hidden text-sm text-text-secondary transition-colors hover:text-text-primary sm:inline"
          >
            Sign in
          </Link>
          <Button asChild size="sm">
            <Link href="/sign-up">Try Excerpta</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
