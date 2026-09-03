// components/settings/BillingSection.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { usePlanDetails, type PlanId } from "@/lib/billing/plans";

interface BillingSectionProps {
  plan: PlanId;
  used: number;
  limit: number;
}

export function BillingSection({ plan, used, limit }: BillingSectionProps) {
  const t = useTranslations("Settings.billing");
  const planDetails = usePlanDetails();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const pct = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));

  async function handleUpgrade(target: "pro" | "team") {
    setLoadingPlan(target);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: target }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleManage() {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{t("heading")}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t("subtitle")}</p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">
            {t("planLabel", { name: planDetails[plan].name })}
          </span>
          <span className="font-sans text-sm text-text-secondary">{t("usageLabel", { used, limit })}</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background">
          <div
            className={`h-full rounded-full ${pct >= 100 ? "bg-error" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {plan !== "free" && (
          <Button variant="secondary" size="sm" className="mt-4" onClick={handleManage} disabled={loadingPortal}>
            {loadingPortal ? t("opening") : t("manageSubscription")}
          </Button>
        )}
      </div>

      {plan !== "team" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(["pro", "team"] as const)
            .filter((id) => id !== plan)
            .map((id) => (
              <div key={id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{planDetails[id].name}</div>
                  <div className="text-xl font-semibold text-text-primary">{planDetails[id].price}</div>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {planDetails[id].features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle size={14} className="shrink-0 text-primary" weight="fill" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button size="sm" onClick={() => handleUpgrade(id)} disabled={loadingPlan === id}>
                  {loadingPlan === id ? t("redirecting") : t("upgradeTo", { name: planDetails[id].name })}
                </Button>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
