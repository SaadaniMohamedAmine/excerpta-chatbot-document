// components/layout/nav-links.ts
//
// Plain data, deliberately NOT in site-nav.tsx: that file is "use client",
// and Next.js replaces every export of a "use client" module — not just its
// component — with an opaque client reference when imported from a Server
// Component. site-footer.tsx renders server-side (via app/(auth)/layout.tsx),
// so importing NAV_LINKS from site-nav.tsx broke there in production builds
// (worked in dev, where this substitution isn't enforced the same way).
//
// `key` maps to Landing.nav.<key> — resolved by whichever component renders
// this list (both SiteNav and SiteFooter call useTranslations themselves).
export const NAV_LINKS = [
  { href: "/#features", key: "features" },
  { href: "/pricing", key: "pricing" },
  { href: "/#whats-new", key: "whatsNew" },
  { href: "/#how-it-works", key: "howItWorks" },
] as const;
