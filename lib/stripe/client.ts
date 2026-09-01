// lib/stripe/client.ts
import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

// Lazy, not a top-level `new Stripe(...)`: this module is imported at build
// time (Next.js collects route metadata by evaluating every route module),
// and instantiating eagerly with an empty STRIPE_SECRET_KEY (unset until
// billing is configured — see .env.local) throws at import time and fails
// the whole build, not just the request. Deferring construction to first
// use means the build succeeds either way, and a billing route hit without
// keys configured fails with a clear message instead of a build crash.
export function getStripe(): Stripe {
  if (!stripeSingleton) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set — add your Stripe test keys to .env.local before using billing."
      );
    }
    // No apiVersion pinned — the installed SDK (stripe@22.6.0) falls back to
    // its own bundled default version when omitted, which stays in sync
    // with the SDK release itself rather than a hardcoded string that can
    // go stale.
    stripeSingleton = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeSingleton;
}
