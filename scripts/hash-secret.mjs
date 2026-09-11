import { randomBytes, scryptSync } from "node:crypto";

/**
 * Prints a `scrypt.…` string for ADMIN_RESET_PIN_HASH.
 *
 * Fields are dot-separated rather than $-separated for one specific reason:
 * Next expands $NAME references when it loads .env, which would eat the cost
 * parameters straight out of the hash and make every check against it fail.
 *
 * The hashing is duplicated from lib/admin/password.ts rather than imported:
 * the generated Prisma client that module's neighbours pull in is TypeScript
 * and gitignored, so a plain .mjs script cannot reach into lib/. Fifteen lines
 * of node:crypto is a cheaper price than a build step for a one-off tool.
 *
 * Keep the parameters below in step with lib/admin/password.ts. A mismatch is
 * harmless for N/r/p — they travel inside the output string and verification
 * reads them from there — but the key length must match.
 *
 * Usage:
 *   echo "your-secret" | node scripts/hash-secret.mjs
 *   node scripts/hash-secret.mjs "your-secret"     # ends up in shell history
 */

const PARAMS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 32;

function hash(secret) {
  const salt = randomBytes(16);
  const key = scryptSync(secret.normalize("NFKC"), salt, KEY_LENGTH, PARAMS);
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64"), key.toString("base64")].join(".");
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

const fromArgv = process.argv[2];
const secret = (fromArgv ?? (await readStdin())).replace(/\r?\n$/, "");

if (!secret) {
  console.error("Nothing to hash. Pipe the secret in, or pass it as the first argument.");
  process.exit(1);
}

if (fromArgv) {
  console.error("Warning: the secret was passed on the command line and is now in your shell history.");
}

console.log(hash(secret));
