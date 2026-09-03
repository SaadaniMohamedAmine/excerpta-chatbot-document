// lib/billing/plans.ts
//
// Safe to import from both client and server components. Deliberately holds
// no Stripe price IDs — those are server-only env vars, read exclusively in
// app/api/billing/checkout/route.ts. If a price ID were read here, importing
// this file from a client component (the /pricing page needs the plan
// copy) would inline `undefined` for it at build time, since server env
// vars without a NEXT_PUBLIC_ prefix never reach the browser bundle.
import { useTranslations } from "next-intl";

export type PlanId = "free" | "pro" | "team";

export const PLAN_LIMITS: Record<PlanId, number> = {
  free: 3,
  pro: 100,
  team: 1000,
};

export interface PlanDetails {
  name: string;
  price: string;
  description: string;
  features: string[];
}

// Plan name/price/description/features are translated content, not static
// data — this is a hook (not a plain export) so every consumer (landing
// page, /pricing, Settings → Billing, the sidebar usage card) reads the
// same messages/{locale}.json source instead of each holding its own copy
// that can drift out of sync.
export function usePlanDetails(): Record<PlanId, PlanDetails> {
  const t = useTranslations("Billing.plans");
  const ids: PlanId[] = ["free", "pro", "team"];
  return Object.fromEntries(
    ids.map((id) => [
      id,
      {
        name: t(`${id}.name`),
        price: t(`${id}.price`),
        description: t(`${id}.description`),
        features: t.raw(`${id}.features`) as string[],
      },
    ])
  ) as Record<PlanId, PlanDetails>;
}
