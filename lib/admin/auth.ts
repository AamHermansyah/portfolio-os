import "server-only";

import { dummySecretHash, hashSecret, verifySecret } from "@/lib/admin/password";
import type { AdminResource } from "@/lib/admin/contract";
import { ADMIN_RESOURCES } from "@/lib/admin/resources";
import { issueToken, readToken, tokenConfigured, TOKEN_TTL_MS } from "@/lib/admin/token";
import { prisma } from "@/lib/prisma";

/**
 * Every decision about who may administer this portfolio is made here, and
 * nowhere else. The Server Actions in app/actions/admin-auth.ts do nothing but
 * shape input and output around these functions — a Server Action is a POST
 * endpoint anyone can reach, so the checks have to live behind it rather than
 * in whatever called it.
 */

/** How far back the durable per-IP counter looks, and how many misses it allows. */
const IP_WINDOW_MS = 15 * 60 * 1000;
const IP_MAX_FAILURES = 10;

/** Per-account lockout: the backstop that survives instance churn. */
const LOCKOUT_AFTER = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

/** Attempts older than this are noise; they are dropped as new ones arrive. */
const ATTEMPT_RETENTION_MS = 24 * 60 * 60 * 1000;

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 10;
const MIN_PIN_LENGTH = 4;

export type AuthError =
  | "not_configured"
  | "rate_limit"
  | "locked"
  | "credentials"
  | "weak_password"
  | "setup_required"
  | "already_setup";

export type Session = {
  token: string;
  expiresAt: number;
  username: string;
  displayName: string | null;
  resources: AdminResource[];
};

export type AuthResult =
  | { ok: true; session: Session }
  | { ok: false; error: AuthError };

/**
 * One generic failure for "no such account" and "wrong password" alike. Any
 * difference between the two — wording, code, or latency — turns the login into
 * an oracle for guessing the username.
 */
const DENIED: AuthResult = { ok: false, error: "credentials" };

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Prunes expired login attempts for this IP, writes the new one, and trims
 * ancient attempts across every IP so the table never grows without bound.
 */
async function recordAttempt(username: string, ok: boolean, ipHash: string): Promise<void> {
  const cutoff = new Date(Date.now() - ATTEMPT_RETENTION_MS);
  await prisma.adminLoginAttempt.create({ data: { username, ok, ipHash } });
  await prisma.adminLoginAttempt.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
}

/**
 * Counts failures from this IP in the current window. Once the budget is
 * exhausted, every call — even one with valid credentials — is refused.
 */
async function ipExhausted(ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - IP_WINDOW_MS);
  const failures = await prisma.adminLoginAttempt.count({
    where: { ipHash, ok: false, createdAt: { gte: since } },
  });
  return failures >= IP_MAX_FAILURES;
}

function sessionFor(user: {
  id: string;
  username: string;
  displayName: string | null;
  tokenVersion: number;
}): Session | null {
  const token = issueToken({ sub: user.id, username: user.username, tokenVersion: user.tokenVersion });
  if (!token) return null;
  return {
    token,
    expiresAt: Date.now() + TOKEN_TTL_MS,
    username: user.username,
    displayName: user.displayName,
    resources: ADMIN_RESOURCES,
  };
}

/** True when the table has no rows yet, so the terminal can offer `setup`. */
export async function needsSetup(): Promise<boolean> {
  return (await prisma.adminUser.count()) === 0;
}

export async function authenticate(rawUsername: string, password: string, ipHash: string): Promise<AuthResult> {
  if (!tokenConfigured()) return { ok: false, error: "not_configured" };
  if (await ipExhausted(ipHash)) return { ok: false, error: "rate_limit" };

  const username = normalizeUsername(rawUsername);
  const user = await prisma.adminUser.findUnique({ where: { username } });

  if (!user) {
    // Spend the same ~100ms a real account would, so a miss cannot be told
    // apart from a wrong password by how quickly this returns.
    await verifySecret(password, await dummySecretHash());
    await recordAttempt(username, false, ipHash);
    return (await needsSetup()) ? { ok: false, error: "setup_required" } : DENIED;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await recordAttempt(username, false, ipHash);
    return { ok: false, error: "locked" };
  }

  if (!(await verifySecret(password, user.passwordHash))) {
    const failedCount = user.failedCount + 1;
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        failedCount,
        lockedUntil: failedCount >= LOCKOUT_AFTER ? new Date(Date.now() + LOCKOUT_MS) : null,
      },
    });
    await recordAttempt(username, false, ipHash);
    return failedCount >= LOCKOUT_AFTER ? { ok: false, error: "locked" } : DENIED;
  }

  const session = sessionFor(user);
  if (!session) return { ok: false, error: "not_configured" };

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { failedCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  await recordAttempt(username, true, ipHash);
  return { ok: true, session };
}

/**
 * Creates the very first administrator. The Recovery PIN provided by the user
 * is hashed and stored directly in the user record in the database.
 */
export async function setupFirstAdmin(
  rawUsername: string,
  pin: string,
  password: string,
  ipHash: string,
): Promise<AuthResult> {
  if (!tokenConfigured()) return { ok: false, error: "not_configured" };
  if (await ipExhausted(ipHash)) return { ok: false, error: "rate_limit" };
  if (!(await needsSetup())) return { ok: false, error: "already_setup" };

  const username = normalizeUsername(rawUsername);
  const cleanPin = pin.trim();
  if (username.length < MIN_USERNAME_LENGTH || password.length < MIN_PASSWORD_LENGTH || cleanPin.length < MIN_PIN_LENGTH) {
    return { ok: false, error: "weak_password" };
  }

  const user = await prisma.adminUser.create({
    data: {
      username,
      passwordHash: await hashSecret(password),
      recoveryPinHash: await hashSecret(cleanPin),
      displayName: rawUsername.trim(),
    },
  });

  const session = sessionFor(user);
  if (!session) return { ok: false, error: "not_configured" };
  await recordAttempt(username, true, ipHash);
  return { ok: true, session };
}

/**
 * Recovery path. Verifies against the user's recoveryPinHash stored in the database.
 * Bumping tokenVersion is what makes it a genuine reset: every token minted before
 * this moment stops verifying.
 */
export async function resetPassword(
  rawUsername: string,
  pin: string,
  password: string,
  ipHash: string,
): Promise<AuthResult> {
  if (!tokenConfigured()) return { ok: false, error: "not_configured" };
  if (await ipExhausted(ipHash)) return { ok: false, error: "rate_limit" };

  const username = normalizeUsername(rawUsername);
  if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, error: "weak_password" };

  const user = await prisma.adminUser.findUnique({ where: { username } });
  let accepted = false;

  if (user && user.recoveryPinHash) {
    accepted = await verifySecret(pin, user.recoveryPinHash);
  } else {
    await verifySecret(pin, await dummySecretHash());
  }

  if (!user || !accepted) {
    await recordAttempt(username, false, ipHash);
    return DENIED;
  }

  const updated = await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashSecret(password),
      tokenVersion: { increment: 1 },
      failedCount: 0,
      lockedUntil: null,
    },
  });

  const session = sessionFor(updated);
  if (!session) return { ok: false, error: "not_configured" };
  await recordAttempt(username, true, ipHash);
  return { ok: true, session };
}

/**
 * The gate every future CRUD action calls first. It re-reads the row rather
 * than trusting the token alone, because tokenVersion is the only way to hang
 * up on a token that has already been handed out.
 */
export async function requireAdmin(token: unknown): Promise<{ id: string; username: string } | null> {
  const result = readToken(token);
  if (!result.ok) return null;

  const user = await prisma.adminUser.findUnique({
    where: { id: result.claims.sub },
    select: { id: true, username: true, tokenVersion: true },
  });
  if (!user || user.tokenVersion !== result.claims.v) return null;

  return { id: user.id, username: user.username };
}
