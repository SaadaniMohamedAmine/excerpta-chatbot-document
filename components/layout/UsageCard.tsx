// components/layout/UsageCard.tsx
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Lightning, Sparkle, Warning } from "@phosphor-icons/react";
import { usePlanDetails, type PlanId } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

export function UsageCard({
  plan,
  used,
  limit,
  collapsed,
}: {
  plan: PlanId;
  used: number;
  limit: number;
  collapsed: boolean;
}) {
  const t = useTranslations("Settings.billing");
  const tBilling = useTranslations("Billing");
  const planDetails = usePlanDetails();
  const pct = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const atLimit = pct >= 100;

  if (collapsed) {
    return (
      <Link
        href="/settings?tab=billing"
        title={`${used}/${limit} — ${t("planLabel", { name: planDetails[plan].name })}`}
        className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background"
      >
        <span className={cn("h-2 w-2 rounded-full", atLimit ? "bg-error" : "bg-primary")} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div className="mx-3 mb-3 overflow-hidden rounded-lg border border-border bg-gradient-to-b from-surface to-background p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-sans text-xs font-medium text-text-primary">
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full",
              atLimit ? "bg-error/15 text-error" : "bg-primary/15 text-primary"
            )}
          >
            <Lightning size={12} weight="fill" />
          </span>
          {t("planLabel", { name: planDetails[plan].name })}
        </span>
        <span className="font-sans text-xs font-medium text-text-secondary">
          {used}/{limit}
        </span>
      </div>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-surface">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-[width] duration-300",
            atLimit ? "from-error to-error/70" : "from-primary to-primary/70"
          )}
          style={{ width: `${Math.max(pct, used > 0 ? 4 : 0)}%` }}
        />
      </div>
      {plan === "free" && (
        <Link
          href="/settings?tab=billing"
          className={cn(
            "mt-2.5 flex items-center justify-center gap-1.5 rounded-md py-1.5 font-sans text-xs font-medium transition-colors",
            atLimit ? "bg-error/10 text-error hover:bg-error/15" : "text-primary hover:bg-primary/10"
          )}
        >
          {atLimit ? <Warning size={12} weight="bold" /> : <Sparkle size={12} weight="fill" />}
          {tBilling("upgrade")}
        </Link>
      )}
    </div>
  );
}
