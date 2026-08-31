// components/layout/UsageCard.tsx
import Link from "next/link";
import { PLAN_DETAILS, type PlanId } from "@/lib/billing/plans";
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
  const pct = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));

  if (collapsed) {
    return (
      <Link
        href="/settings?tab=billing"
        title={`${used}/${limit} documents this month — ${PLAN_DETAILS[plan].name} plan`}
        className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background"
      >
        <span className={cn("h-2 w-2 rounded-full", pct >= 100 ? "bg-error" : "bg-primary")} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div className="mx-3 mb-3 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between font-sans text-xs">
        <span className="font-medium text-text-primary">{PLAN_DETAILS[plan].name} plan</span>
        <span className="text-text-secondary">
          {used}/{limit}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div
          className={cn("h-full rounded-full transition-[width]", pct >= 100 ? "bg-error" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
      {plan === "free" && (
        <Link
          href="/settings?tab=billing"
          className="mt-2 block text-center font-sans text-xs font-medium text-primary hover:underline"
        >
          Upgrade
        </Link>
      )}
    </div>
  );
}
