// lib/rate-limit.ts
//
// In-memory, per-server-instance rate limiting — no new external service or
// env var needed to add this. On Vercel's serverless runtime each warm
// lambda instance keeps its own counters (not shared across instances or
// regions), so this is best-effort throttling of a client hammering the
// same warm instance, not a hard distributed guarantee across the whole
// deployment. If traffic ever justifies a real distributed limiter, this
// account already runs Upstash Vector — adding Upstash Redis + @upstash/
// ratelimit alongside it is the natural upgrade path; swap the body of
// rateLimit() for that and every call site here stays unchanged.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Sweeps expired buckets periodically so this Map doesn't grow unbounded on
// a long-lived warm instance.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();
function sweepExpired(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the caller can retry — only meaningful when `ok` is false. */
  retryAfterSeconds: number;
}

/**
 * Fixed-window rate limit: at most `limit` calls per `windowMs` for a given
 * key. Callers key this by route + user id (e.g. `chat:${userId}`) so limits
 * are per-user, never per-IP (proxied/shared IPs would otherwise collide).
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}
