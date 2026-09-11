import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * The admin session token.
 *
 * It is deliberately stateless. The terminal keeps the token in a plain
 * JavaScript variable and nowhere else — no cookie, no localStorage — so a page
 * reload signs you out, which is the whole point. That rules out a server-side
 * token store too: this deploys serverless, where the instance that handles the
 * next command has never seen the login, and an in-memory store would reject
 * valid tokens at random.
 *
 * Revocation is handled by `tokenVersion` on the AdminUser row: the value is
 * signed into the token and compared on every authorized call, so bumping the
 * column invalidates everything already issued.
 */

export const TOKEN_TTL_MS = 30 * 60 * 1000;

/** The shortest secret worth accepting; below this, fail rather than pretend. */
const MIN_SECRET_LENGTH = 32;

export type TokenClaims = {
  /** AdminUser.id */
  sub: string;
  /** Username, carried so the terminal can greet without another round trip. */
  u: string;
  /** AdminUser.tokenVersion at the time of issue. */
  v: number;
  /** Expiry, epoch milliseconds. */
  exp: number;
};

export type ReadResult =
  | { ok: true; claims: TokenClaims }
  | { ok: false; error: "not_configured" | "malformed" | "signature" | "expired" };

/**
 * Read lazily and never cached, matching how the rest of the project treats
 * configuration (see app/api/hire/route.ts). Returns null rather than throwing
 * so a deployment without the variable degrades to "administration is off"
 * instead of taking the whole site down.
 */
function secret(): string | null {
  const value = process.env.ADMIN_TOKEN_SECRET;
  if (typeof value !== "string" || value.length < MIN_SECRET_LENGTH) return null;
  return value;
}

export function tokenConfigured(): boolean {
  return secret() !== null;
}

function sign(body: string, key: string): string {
  return createHmac("sha256", key).update(body).digest("base64url");
}

export function issueToken(input: { sub: string; username: string; tokenVersion: number }): string | null {
  const key = secret();
  if (!key) return null;

  const claims: TokenClaims = {
    sub: input.sub,
    u: input.username,
    v: input.tokenVersion,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(claims), "utf8").toString("base64url");
  return `${body}.${sign(body, key)}`;
}

export function readToken(token: unknown): ReadResult {
  const key = secret();
  if (!key) return { ok: false, error: "not_configured" };
  if (typeof token !== "string" || token.length > 4096) return { ok: false, error: "malformed" };

  const dot = token.indexOf(".");
  if (dot < 1 || dot === token.length - 1) return { ok: false, error: "malformed" };

  const body = token.slice(0, dot);
  const provided = Buffer.from(token.slice(dot + 1), "base64url");
  const expected = Buffer.from(sign(body, key), "base64url");

  // Signature is checked before the payload is trusted enough to parse, and the
  // length is compared separately because timingSafeEqual throws on a mismatch.
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return { ok: false, error: "signature" };
  }

  let claims: TokenClaims;
  try {
    claims = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenClaims;
  } catch {
    return { ok: false, error: "malformed" };
  }

  if (
    typeof claims?.sub !== "string" ||
    typeof claims?.u !== "string" ||
    typeof claims?.v !== "number" ||
    typeof claims?.exp !== "number"
  ) {
    return { ok: false, error: "malformed" };
  }

  if (claims.exp <= Date.now()) return { ok: false, error: "expired" };

  return { ok: true, claims };
}
