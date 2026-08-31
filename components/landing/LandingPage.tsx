// components/landing/LandingPage.tsx
"use client";

import Link from "next/link";
import {
  FileArrowUp,
  Quotes,
  CursorClick,
  ArrowRight,
  Check,
  Sparkle,
  ShareNetwork,
  FileArrowDown,
  Gear,
} from "@phosphor-icons/react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { BackToTop } from "@/components/ui/back-to-top";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { useSession } from "@/lib/auth-client";
import { PLAN_DETAILS, type PlanId } from "@/lib/billing/plans";

const FEATURES = [
  {
    icon: FileArrowUp,
    title: "Multi-format upload",
    description:
      "PDF, DOCX, CSV, and code files upload as-is. No conversion step, no lost formatting.",
  },
  {
    icon: Quotes,
    title: "Source citations",
    description:
      "Every answer names the exact page it came from — not a paraphrase you have to take on faith.",
  },
  {
    icon: CursorClick,
    title: "Auto-scroll to source",
    description:
      "Click a citation and the document jumps straight to the passage, highlighted in place.",
  },
] as const;

const PLAN_CTA_LABEL: Record<PlanId, string> = {
  free: "Get started",
  pro: "Choose Pro",
  team: "Choose Team",
};

// Full plan comparison and the actual upgrade/checkout flow live on
// /pricing (and Settings → Billing) — landing page cards link there rather
// than duplicating that logic here.
const PLANS = (Object.keys(PLAN_DETAILS) as PlanId[]).map((id) => ({
  id,
  name: PLAN_DETAILS[id].name,
  price: PLAN_DETAILS[id].price,
  tagline: PLAN_DETAILS[id].description,
  features: PLAN_DETAILS[id].features,
  cta: { label: PLAN_CTA_LABEL[id], href: "/pricing" },
  highlighted: id === "pro",
}));

const CHANGELOG = [
  {
    icon: Sparkle,
    title: "Polished landing experience",
    description: "A dedicated public landing page, SEO metadata, and a real preview image.",
  },
  {
    icon: Gear,
    title: "Account & appearance settings",
    description: "Manage your profile, switch themes, and delete your account and data.",
  },
  {
    icon: ShareNetwork,
    title: "Public sharing",
    description: "Turn any conversation into a read-only link anyone can open, no sign-in needed.",
  },
  {
    icon: FileArrowDown,
    title: "Export conversations",
    description: "Download any conversation as a formatted PDF or DOCX, citations included.",
  },
] as const;

const STEPS = [
  {
    number: "1",
    title: "Upload your document",
    description:
      "Drop in a PDF, Word file, spreadsheet, or code file. Excerpta parses it and prepares it for search in seconds.",
  },
  {
    number: "2",
    title: "Ask a question",
    description:
      "Ask in plain language. Excerpta searches the full document for the passages that actually answer it.",
  },
  {
    number: "3",
    title: "Get a cited answer",
    description:
      "Read the answer, then click any citation to jump straight to the source page — highlighted, in context.",
  },
] as const;

export default function LandingPage() {
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <SiteNav />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Chat with any document.
                <br />
                <span className="text-primary">Every answer cited to the page.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-text-secondary">
                Precise answers, cited to the line. Upload a PDF, DOCX, spreadsheet, or
                code file, and ask it anything — every claim traces back to its source.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild size="lg">
                  <Link
                    href={isSignedIn ? "/documents" : "/sign-up"}
                    className="inline-flex items-center gap-2"
                  >
                    {isSignedIn ? "Go to Documents" : "Try Excerpta"}
                    <ArrowRight size={18} weight="bold" />
                  </Link>
                </Button>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  See how it works
                </a>
              </div>
            </Reveal>

            {/* Hero visual: a static illustration of the split viewer/chat UI.
                No screenshot exists yet — this is a decorative mockup built
                entirely from divs and the design tokens. */}
            <Reveal delayMs={150} className="relative">
              <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
                <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-error/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                  <span className="ml-3 truncate text-xs text-text-secondary">
                    quarterly-report.pdf
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  {/* Fake document pane */}
                  <div className="space-y-2 border-r border-border p-4">
                    <div className="h-2.5 w-4/5 rounded bg-border" />
                    <div className="h-2.5 w-full rounded bg-border" />
                    <div className="h-2.5 w-full rounded bg-gold/40" />
                    <div className="h-2.5 w-3/5 rounded bg-gold/40" />
                    <div className="h-2.5 w-full rounded bg-border" />
                    <div className="h-2.5 w-4/5 rounded bg-border" />
                    <div className="h-2.5 w-2/3 rounded bg-border" />
                    <div className="mt-4 text-center text-[10px] text-text-secondary">
                      Page 4 of 12
                    </div>
                  </div>
                  {/* Fake chat pane */}
                  <div className="flex flex-col gap-3 p-4">
                    <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-primary px-3 py-2 text-xs text-white">
                      What was Q3 revenue growth?
                    </div>
                    <div className="max-w-[90%] rounded-lg rounded-tl-sm bg-background px-3 py-2 text-xs text-text-primary">
                      Revenue grew 18% quarter over quarter.
                      <span className="ml-1 inline-flex items-center rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-text-primary">
                        p. 4
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-primary/10"
              />
            </Reveal>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <Reveal className="max-w-2xl">
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                Built to answer with evidence.
              </h2>
              <p className="mt-4 text-text-secondary">
                Excerpta is not a generic chatbot pointed at a file. Every part of it
                exists to keep an answer traceable to the exact place it came from.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, index) => (
                <Reveal key={feature.title} delayMs={index * 80}>
                  <Card className="group h-full cursor-pointer border-border bg-background p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <feature.icon size={24} weight="duotone" />
                    </span>
                    <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{feature.description}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <Reveal className="max-w-2xl">
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                Simple, transparent pricing.
              </h2>
              <p className="mt-4 text-text-secondary">
                Start free, upgrade when you need more room.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {PLANS.map((plan, index) => (
                <Reveal key={plan.name} delayMs={index * 80}>
                  <Card
                    className={`h-full cursor-pointer border-border bg-surface p-6 ${
                      plan.highlighted ? "ring-1 ring-primary/30" : ""
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      {plan.highlighted && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          Most popular
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-2xl font-semibold">{plan.price}</p>
                    <p className="mt-2 text-sm text-text-secondary">{plan.tagline}</p>
                    <ul className="mt-6 flex flex-col gap-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check
                            size={16}
                            weight="bold"
                            className="mt-0.5 shrink-0 text-primary"
                          />
                          <span className="text-text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant={plan.highlighted ? "primary" : "secondary"} className="mt-6 w-full">
                      <Link href={plan.cta.href}>{plan.cta.label}</Link>
                    </Button>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* What's new */}
        <section id="whats-new" className="scroll-mt-20 border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <Reveal className="max-w-2xl">
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                What&apos;s new.
              </h2>
              <p className="mt-4 text-text-secondary">
                Excerpta is actively evolving. Here&apos;s what shipped most recently.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {CHANGELOG.map((entry, index) => (
                <Reveal key={entry.title} delayMs={index * 80}>
                  <Card className="group flex h-full cursor-pointer gap-4 border-border bg-background p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <entry.icon size={20} weight="duotone" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold">{entry.title}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{entry.description}</p>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-text-secondary">
              Three steps, from a raw file to an answer you can verify.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step, index) => (
              <Reveal key={step.number} delayMs={index * 120} className="relative">
                <div className="flex items-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-base font-semibold text-white shadow-md shadow-primary/20">
                    {step.number}
                  </span>
                  {index < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="mx-3 hidden h-0.5 flex-1 bg-gradient-to-r from-primary to-border sm:block"
                    />
                  )}
                </div>
                <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />

      <BackToTop />
    </div>
  );
}
