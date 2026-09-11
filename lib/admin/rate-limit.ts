import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
 * The fast, in-memory half of the sign-in throttle, shaped after the one in
 * app/api/hire/route.ts.
 *
 * Be clear-eyed about what it is: per-instance, and it resets on every redeploy
 * and cold start. On a serverless deployment that means an attacker who spreads
 * attempts across instances gets a fresh budget each time. It exists to absorb
 * a burst cheaply, before the request costs a database round trip. The limit
 * that actually holds is the durable one in lib/admin/auth.ts, counted from the
 * AdminLoginAttempt table, plus the per-account lockout behind it.
 */

const buckets = new Map<string, number[]>();

export type Budget = { windowMs: number; max: number };

/**
 * Ordinary sign-in. Deliberately roomy, because this budget is spent by
 * successes as well as failures and a reload signs the owner out by design —
 * someone iterating on their own portfolio can legitimately sign in a dozen
 * times in an hour, and locking them out of their own site would be the bug.
 * Brute force is answered by the durable failure counter and the per-account
 * lockout in auth.ts, both of which count only misses.
 */
export const LOGIN_BUDGET: Budget = { windowMs: 10 * 60 * 1000, max: 30 };

/** The reset PIN bypasses the password entirely, so it gets a far tighter leash. */
export const RESET_BUDGET: Budget = { windowMs: 60 * 60 * 1000, max: 3 };

/**
 * The client address, hashed. Sign-in attempts are stored durably and an IP is
 * personal data; a SHA-256 is just as countable and far less interesting to
 * anyone who reads the table later.
 */
export async function clientFingerprint(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  const address = first || headerList.get("x-real-ip") || "unknown";
  return createHash("sha256").update(address).digest("hex");
}

/** Records a hit and reports whether this caller has now exceeded `budget`. */
export function overBudget(scope: string, fingerprint: string, budget: Budget): boolean {
  const key = `${scope}:${fingerprint}`;
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((at) => now - at < budget.windowMs);
  hits.push(now);
  buckets.set(key, hits);

  if (buckets.size > 500) {
    for (const [existing, times] of buckets) {
      if (times.every((at) => now - at >= budget.windowMs)) buckets.delete(existing);
    }
  }

  return hits.length > budget.max;
}
