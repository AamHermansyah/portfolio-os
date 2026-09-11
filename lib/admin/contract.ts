/**
 * The wire contract between the Server Actions and the browser.
 *
 * It lives in its own module for two reasons. A file carrying the "use server"
 * directive may only export async functions, so the types cannot live beside
 * the actions; and lib/admin/auth.ts is marked server-only, so the client
 * cannot reach in there either. This module imports nothing and is safe on
 * both sides of the boundary.
 */

export type AdminResource = {
  id: string;
  status: "ready" | "planned";
  label: string;
};

/**
 * Deliberately narrow. The AdminUser row never crosses the boundary — no hash,
 * no failure counter, no last-seen address.
 */
export type AdminSessionDto = {
  token: string;
  expiresAt: number;
  username: string;
  displayName: string | null;
  resources: AdminResource[];
};

/**
 * Failure codes, not sentences. The runtime maps them to wording, exactly as
 * runtime/portfolio-os/12-inquiry-hire.js already does for /api/hire, so the
 * server never dictates copy and never leaks detail by accident.
 */
export type AdminAuthResult =
  | { ok: true; session: AdminSessionDto }
  | { ok: false; error: string };
