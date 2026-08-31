// components/layout/nav-links.ts
//
// Plain data, deliberately NOT in site-nav.tsx: that file is "use client",
// and Next.js replaces every export of a "use client" module — not just its
// component — with an opaque client reference when imported from a Server
// Component. site-footer.tsx renders server-side (via app/(auth)/layout.tsx),
// so importing NAV_LINKS from site-nav.tsx broke there in production builds
// (worked in dev, where this substitution isn't enforced the same way).
export const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#whats-new", label: "What's new" },
  { href: "/#how-it-works", label: "How it works" },
] as const;
