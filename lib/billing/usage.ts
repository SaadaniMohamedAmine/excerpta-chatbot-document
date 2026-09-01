// lib/billing/usage.ts
//
// Reset policy: usage resets on calendar month change (UTC), not on the
// Stripe subscription's billing anniversary — the Free plan has no Stripe
// subscription to anchor on, and syncing to Stripe's current_period_start
// would need a separate cron job. The reset is checked lazily, on the next
// read/write of usage after the month has turned over — no scheduled job
// needed.
import { prisma } from "@/lib/db";
import { PLAN_LIMITS, type PlanId } from "./plans";

function isNewCalendarMonth(periodStart: Date, now: Date): boolean {
  return (
    now.getUTCFullYear() !== periodStart.getUTCFullYear() ||
    now.getUTCMonth() !== periodStart.getUTCMonth()
  );
}

export interface Usage {
  plan: PlanId;
  used: number;
  limit: number;
  remaining: number;
}

export async function getUsage(userId: string): Promise<Usage> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { plan: true, uploadCount: true, uploadPeriodStart: true },
  });

  const now = new Date();
  let uploadCount = user.uploadCount;

  if (isNewCalendarMonth(user.uploadPeriodStart, now)) {
    await prisma.user.update({
      where: { id: userId },
      data: { uploadCount: 0, uploadPeriodStart: now },
    });
    uploadCount = 0;
  }

  const plan = user.plan as PlanId;
  const limit = PLAN_LIMITS[plan];
  return { plan, used: uploadCount, limit, remaining: Math.max(0, limit - uploadCount) };
}

export async function assertCanUpload(userId: string): Promise<void> {
  const { remaining } = await getUsage(userId);
  if (remaining <= 0) {
    throw new Error(
      "You've reached your monthly upload limit. Upgrade your plan to add more documents."
    );
  }
}

export async function incrementUsage(userId: string): Promise<void> {
  // Re-checks the period first — covers the case where this is the first
  // upload of a new month for a user who hasn't opened the app since.
  await getUsage(userId);
  await prisma.user.update({
    where: { id: userId },
    data: { uploadCount: { increment: 1 } },
  });
}
