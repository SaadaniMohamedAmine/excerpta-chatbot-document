// app/pricing/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { PLAN_DETAILS, type PlanId } from "@/lib/billing/plans";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  async function handleSelect(planId: PlanId) {
    if (planId === "free") {
      router.push(session?.user ? "/documents" : "/sign-up");
      return;
    }
    if (!session?.user) {
      router.push("/sign-up");
      return;
    }
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <SiteNav />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple, honest pricing.
            </h1>
            <p className="mt-3 text-text-secondary">Start free. Upgrade when you outgrow it.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {(Object.keys(PLAN_DETAILS) as PlanId[]).map((id) => {
              const plan = PLAN_DETAILS[id];
              const isPro = id === "pro";
              return (
                <div
                  key={id}
                  className={`flex flex-col gap-4 rounded-xl border p-6 ${
                    isPro ? "border-primary shadow-lg" : "border-border"
                  } bg-surface`}
                >
                  {isPro && (
                    <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 font-sans text-xs font-medium text-primary">
                      Most popular
                    </span>
                  )}
                  <div>
                    <h2 className="font-sans text-lg font-semibold text-text-primary">{plan.name}</h2>
                    <p className="mt-1 font-sans text-sm text-text-secondary">{plan.description}</p>
                  </div>
                  <div className="font-sans text-3xl font-semibold text-text-primary">{plan.price}</div>
                  <ul className="flex flex-1 flex-col gap-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 font-sans text-sm text-text-secondary">
                        <CheckCircle size={16} className="shrink-0 text-primary" weight="fill" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isPro ? "primary" : "secondary"}
                    onClick={() => handleSelect(id)}
                    disabled={loadingPlan === id}
                  >
                    {loadingPlan === id ? "Redirecting…" : id === "free" ? "Get started" : `Choose ${plan.name}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
