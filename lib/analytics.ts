// lib/analytics.ts
import type { WeekPoint } from "@/components/analytics/DocumentsPerWeekChart";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Buckets timestamps into `weeks` trailing 7-day windows ending today, oldest
// first. Fixed-size windows anchored to "now" rather than calendar weeks —
// simpler and stable regardless of a user's locale/week-start convention.
export function buildWeeklyBuckets(dates: Date[], weeks = 8): WeekPoint[] {
  const now = new Date();
  const buckets: WeekPoint[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const windowEnd = new Date(now.getTime() - i * WEEK_MS);
    const windowStart = new Date(windowEnd.getTime() - WEEK_MS);
    const count = dates.filter((date) => date > windowStart && date <= windowEnd).length;
    buckets.push({
      label: windowEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
    });
  }

  return buckets;
}
