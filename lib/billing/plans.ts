// lib/billing/plans.ts
//
// Safe to import from both client and server components. Deliberately holds
// no Stripe price IDs — those are server-only env vars, read exclusively in
// app/api/billing/checkout/route.ts. If a price ID were read here, importing
// this file from a client component (the /pricing page needs the plan
// copy) would inline `undefined` for it at build time, since server env
// vars without a NEXT_PUBLIC_ prefix never reach the browser bundle.
export type PlanId = "free" | "pro" | "team";

export const PLAN_LIMITS: Record<PlanId, number> = {
  free: 3,
  pro: 100,
  team: 1000,
};

export const PLAN_DETAILS: Record<
  PlanId,
  { name: string; price: string; description: string; features: string[] }
> = {
  free: {
    name: "Free",
    price: "$0",
    description: "Try Excerpta with a handful of documents every month.",
    features: ["3 documents / month", "PDF, DOCX, CSV, code", "Cited answers", "Collections"],
  },
  pro: {
    name: "Pro",
    price: "$12/mo",
    description: "For individuals working with documents regularly.",
    features: ["100 documents / month", "Everything in Free", "Priority processing"],
  },
  team: {
    name: "Team",
    price: "$39/mo",
    description: "For small teams sharing a lot of documents.",
    features: ["1,000 documents / month", "Everything in Pro", "Shared usage pool"],
  },
};
