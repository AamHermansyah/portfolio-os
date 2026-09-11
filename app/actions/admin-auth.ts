"use server";

import {
  authenticate,
  needsSetup,
  resetPassword,
  setupFirstAdmin,
  type AuthResult,
} from "@/lib/admin/auth";
import type { AdminAuthResult } from "@/lib/admin/contract";
import {
  clientFingerprint,
  LOGIN_BUDGET,
  overBudget,
  RESET_BUDGET,
} from "@/lib/admin/rate-limit";

/**
 * Sign-in for the terminal, as Server Actions.
 *
 * Two rules govern everything in this file.
 *
 * First, every export must be an async function — that is what the "use server"
 * directive requires — which is why the resource list and the wire types live
 * in lib/admin/contract.ts and lib/admin/resources.ts instead of here.
 *
 * Second, and less obvious: none of these may call cookies(), revalidatePath,
 * revalidateTag, refresh or redirect. Any of those makes the action respond
 * with an RSC re-render, and only React can apply one. These actions are called
 * from the PortfolioOS runtime, which is a plain browser script outside React
 * entirely (see components/atoms/admin-bridge.tsx), so such a response would
 * break at the call site. It happens to cost nothing here: the session is
 * deliberately cookie-free, so there was never anything to set.
 */

/** Capped before any work happens; a 10MB password is otherwise a free 10MB scrypt. */
const FIELD_LIMITS = {
  username: 64,
  password: 200,
  pin: 64,
} as const;

type Field = keyof typeof FIELD_LIMITS;

function readField(raw: unknown, field: Field): string {
  return typeof raw === "string" ? raw.slice(0, FIELD_LIMITS[field]) : "";
}

/** Strips the AuthResult down to what the browser is allowed to see. */
function toDto(result: AuthResult): AdminAuthResult {
  if (!result.ok) return { ok: false, error: result.error };
  return {
    ok: true,
    session: {
      token: result.session.token,
      expiresAt: result.session.expiresAt,
      username: result.session.username,
      displayName: result.session.displayName,
      resources: result.session.resources,
    },
  };
}

function failed(error: string): AdminAuthResult {
  return { ok: false, error };
}

/**
 * Logged with the outcome and the hashed address only. The attempted username
 * is left out on purpose: a typo on one attempt is somebody else's password on
 * the next, and neither belongs in a log file.
 */
function note(action: string, outcome: string, fingerprint: string): void {
  console.error(`[admin] ${action} ${outcome} for ${fingerprint.slice(0, 12)}`);
}

export async function adminLogin(rawUsername: unknown, rawPassword: unknown): Promise<AdminAuthResult> {
  const fingerprint = await clientFingerprint();
  if (overBudget("login", fingerprint, LOGIN_BUDGET)) return failed("rate_limit");

  const username = readField(rawUsername, "username").trim();
  const password = readField(rawPassword, "password");
  if (!username || !password) return failed("validation");

  try {
    const result = await authenticate(username, password, fingerprint);
    if (!result.ok) note("login", result.error, fingerprint);
    return toDto(result);
  } catch (error) {
    console.error("[admin] login failed:", error);
    return failed("server");
  }
}

/** Creates the first administrator. Refuses once one exists. */
export async function adminSetup(
  rawUsername: unknown,
  rawPin: unknown,
  rawPassword: unknown,
): Promise<AdminAuthResult> {
  const fingerprint = await clientFingerprint();
  if (overBudget("reset", fingerprint, RESET_BUDGET)) return failed("rate_limit");

  const username = readField(rawUsername, "username").trim();
  const pin = readField(rawPin, "pin");
  const password = readField(rawPassword, "password");
  if (!username || !pin || !password) return failed("validation");

  try {
    const result = await setupFirstAdmin(username, pin, password, fingerprint);
    if (!result.ok) note("setup", result.error, fingerprint);
    return toDto(result);
  } catch (error) {
    console.error("[admin] setup failed:", error);
    return failed("server");
  }
}

/** Recovery with the PIN. Invalidates every token already issued. */
export async function adminReset(
  rawUsername: unknown,
  rawPin: unknown,
  rawPassword: unknown,
): Promise<AdminAuthResult> {
  const fingerprint = await clientFingerprint();
  if (overBudget("reset", fingerprint, RESET_BUDGET)) return failed("rate_limit");

  const username = readField(rawUsername, "username").trim();
  const pin = readField(rawPin, "pin");
  const password = readField(rawPassword, "password");
  if (!username || !pin || !password) return failed("validation");

  try {
    const result = await resetPassword(username, pin, password, fingerprint);
    if (!result.ok) note("reset", result.error, fingerprint);
    return toDto(result);
  } catch (error) {
    console.error("[admin] reset failed:", error);
    return failed("server");
  }
}

/**
 * Whether the terminal should offer `setup` instead of `login`. Deliberately
 * says nothing else — it is the one piece of state readable without credentials,
 * and all it reveals is whether an installation has been finished.
 */
export async function adminNeedsSetup(): Promise<{ ok: true; needsSetup: boolean } | { ok: false; error: string }> {
  try {
    return { ok: true, needsSetup: await needsSetup() };
  } catch (error) {
    console.error("[admin] setup probe failed:", error);
    return { ok: false, error: "server" };
  }
}
