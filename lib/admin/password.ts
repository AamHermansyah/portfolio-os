import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing with nothing but `node:crypto`.
 *
 * scrypt is the only memory-hard KDF in the Node standard library, which is why
 * it is here instead of argon2id: this project has stayed deliberately
 * dependency-thin — no validation library, no auth library — and a single-owner
 * login does not justify reversing that.
 *
 * The cost parameters are stored *inside* the hash string, so raising them
 * later re-hashes new passwords without invalidating the ones already stored.
 *
 * The fields are joined with "." rather than the conventional "$" because one
 * of these hashes has to live in .env (ADMIN_RESET_PIN_HASH), and Next expands
 * $NAME references when it loads that file: "scrypt$32768$8$1$salt$key" reaches
 * the process as "scrypt==...", quietly missing its cost parameters and every
 * verification against it fails. A dot is outside the base64 alphabet, so it
 * separates just as unambiguously and survives the trip.
 */

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

/**
 * scrypt allocates `128 * N * r` bytes — exactly 32 MiB at N=32768 — and Node's
 * default ceiling is also exactly 32 MiB, so the call throws "memory limit
 * exceeded" unless the ceiling is raised. Verified on Node v22.23.2: N=16384
 * passes with the default, N=32768 does not. Forgetting this is the usual way
 * a scrypt implementation ships broken.
 */
const MAX_MEMORY = 64 * 1024 * 1024;
const PARAMS = { N: 32768, r: 8, p: 1, maxmem: MAX_MEMORY } as const;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

/** Composition differences must not decide whether a password matches. */
function normalize(secret: string): string {
  return secret.normalize("NFKC");
}

/** Produces `scrypt.N.r.p.salt.key` — self-describing, one column, easy to parse. */
export async function hashSecret(secret: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await scryptAsync(normalize(secret), salt, KEY_LENGTH, PARAMS);
  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64"),
    key.toString("base64"),
  ].join(".");
}

/** Constant-time verification. Returns false for malformed input, never throws. */
export async function verifySecret(secret: string, stored: string): Promise<boolean> {
  const parts = stored.split(".");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

  const salt = Buffer.from(parts[4], "base64");
  const expected = Buffer.from(parts[5], "base64");
  if (salt.length === 0 || expected.length === 0) return false;

  let actual: Buffer;
  try {
    actual = await scryptAsync(normalize(secret), salt, expected.length, { N, r, p, maxmem: MAX_MEMORY });
  } catch {
    // Parameters outside what this process will allocate. Not a match, not a crash.
    return false;
  }

  // timingSafeEqual throws when the lengths differ, so length is checked first
  // and separately — the length is not the secret, the bytes are.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * A real hash of a value nobody knows, to verify against when the username does
 * not exist. Without it the miss returns ~100ms sooner than a wrong password on
 * a real account, and that gap is a username oracle. Computed once per process.
 */
let dummy: Promise<string> | null = null;
export function dummySecretHash(): Promise<string> {
  dummy ??= hashSecret(randomBytes(32).toString("base64"));
  return dummy;
}
