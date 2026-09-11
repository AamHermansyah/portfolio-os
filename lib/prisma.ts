import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma Client for the Neon Postgres behind PortfolioOS.
 *
 * Prisma 7 reaches Postgres through a driver adapter instead of its own bundled
 * engine, and the Neon adapter speaks Neon's WebSocket protocol — which is what
 * lets a cold serverless invocation reuse Neon's pooler rather than pay for a
 * fresh TCP + TLS handshake of its own.
 *
 * `DATABASE_URL` is the *pooled* endpoint (note `-pooler` in the host); that is
 * the right one for request handlers. Schema work is the opposite case and runs
 * over `DATABASE_URL_UNPOOLED` — see `prisma7.config.ts`. `neon link` writes
 * both into `.env`.
 *
 * On Node 21 and below this would also need `neonConfig.webSocketConstructor`
 * pointed at the `ws` package; Node 22 has a global `WebSocket`, so it doesn't.
 */
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set — run `neon link` to pull it into .env, " +
        "or copy the connection string from the Neon console.",
    );
  }

  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}

/**
 * `next dev` re-evaluates this module on every edit. Without parking the client
 * on `globalThis`, each reload would leak another connection pool until Neon
 * starts turning new ones away.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
