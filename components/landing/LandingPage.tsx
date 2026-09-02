// components/landing/LandingPage.tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
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

// Icons stay in code, matched to translated title/description by array
// position — see the Landing.features/whatsNew/howItWorks.steps message
// namespaces for the actual copy.
const FEATURE_ICONS = [FileArrowUp, Quotes, CursorClick] as const;
const CHANGELOG_ICONS = [Sparkle, Gear, ShareNetwork, FileArrowDown] as const;
const STEP_NUMBERS = ["1", "2", "3"] as const;

// Full plan comparison and the actual upgrade/checkout flow live on
// /pricing (and Settings → Billing) — landing page cards link there rather
// than duplicating that logic here. Plan name/price/description/features
// stay in English for now — lib/billing/plans.ts translation is a separate
// task (it's also read by Settings and the sidebar usage card).
const PLAN_IDS = Object.keys(PLAN_DETAILS) as PlanId[];

export default function LandingPage() {
  const t = useTranslations("Landing");
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user);

  const features = t.raw("features.items") as { title: string; description: string }[];
  const changelog = t.raw("whatsNew.items") as { title: string; description: string }[];
  const steps = t.raw("howItWorks.steps") as { title: string; description: string }[];
  const plans = PLAN_IDS.map((id) => ({
    id,
    name: PLAN_DETAILS[id].name,
    price: PLAN_DETAILS[id].price,
    tagline: PLAN_DETAILS[id].description,
    features: PLAN_DETAILS[id].features,
    cta: {
      label: id === "free" ? t("pricing.ctaFree") : t("pricing.ctaChoosePlan", { plan: PLAN_DETAILS[id].name }),
      href: "/pricing",
    },
    highlighted: id === "pro",
  }));

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <SiteNav />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                {t("hero.titleLine1")}
                <br />
                <span className="text-primary">{t("hero.titleHighlight")}</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-text-secondary">{t("hero.subtitle")}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild size="lg">
                  <Link
                    href={isSignedIn ? "/documents" : "/sign-up"}
                    className="inline-flex items-center gap-2"
                  >
                    {isSignedIn ? t("hero.ctaSignedIn") : t("hero.ctaSignedOut")}
                    <ArrowRight size={18} weight="bold" />
                  </Link>
                </Button>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  {t("hero.howItWorksLink")}
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
                    {t("hero.mockFileName")}
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
                      {t("hero.mockPageLabel")}
                    </div>
                  </div>
                  {/* Fake chat pane */}
                  <div className="flex flex-col gap-3 p-4">
                    <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-primary px-3 py-2 text-xs text-white">
                      {t("hero.mockQuestion")}
                    </div>
                    <div className="max-w-[90%] rounded-lg rounded-tl-sm bg-background px-3 py-2 text-xs text-text-primary">
                      {t("hero.mockAnswer")}
                      <span className="ml-1 inline-flex items-center rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-text-primary">
                        {t("hero.mockCitation")}
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
                {t("features.heading")}
              </h2>
              <p className="mt-4 text-text-secondary">{t("features.subtitle")}</p>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = FEATURE_ICONS[index];
                return (
                  <Reveal key={feature.title} delayMs={index * 80}>
                    <Card className="group h-full cursor-pointer border-border bg-background p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                        <Icon size={24} weight="duotone" />
                      </span>
                      <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-sm text-text-secondary">{feature.description}</p>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <Reveal className="max-w-2xl">
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("pricing.heading")}
              </h2>
              <p className="mt-4 text-text-secondary">{t("pricing.subtitle")}</p>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {plans.map((plan, index) => (
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
                          {t("pricing.mostPopular")}
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
                {t("whatsNew.heading")}
              </h2>
              <p className="mt-4 text-text-secondary">{t("whatsNew.subtitle")}</p>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {changelog.map((entry, index) => {
                const Icon = CHANGELOG_ICONS[index];
                return (
                  <Reveal key={entry.title} delayMs={index * 80}>
                    <Card className="group flex h-full cursor-pointer gap-4 border-border bg-background p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                        <Icon size={20} weight="duotone" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold">{entry.title}</h3>
                        <p className="mt-1 text-sm text-text-secondary">{entry.description}</p>
                      </div>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("howItWorks.heading")}
            </h2>
            <p className="mt-4 text-text-secondary">{t("howItWorks.subtitle")}</p>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {steps.map((step, index) => (
              <Reveal key={step.title} delayMs={index * 120} className="relative">
                <div className="flex items-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-base font-semibold text-white shadow-md shadow-primary/20">
                    {STEP_NUMBERS[index]}
                  </span>
                  {index < steps.length - 1 && (
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
