import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/auth";
import { loadPortfolioContent } from "@/lib/portfolio/content";

/**
 * Called by the terminal after every successful create, edit or delete.
 *
 * The home page is prerendered with the public content baked in, so a write
 * is invisible until that page is regenerated. The CRUD Server Actions cannot
 * trigger that themselves — a revalidation inside an action answers with an
 * RSC re-render the non-React runtime cannot apply (see
 * app/actions/admin-auth.ts) — but a Route Handler can, and its reply is plain
 * JSON. The reply also carries the fresh content, so the tab that made the
 * change updates without a reload.
 *
 * Authorization is the same bearer token the CRUD actions take, re-checked
 * here: this endpoint is public, and a revalidation is work worth refusing to
 * strangers.
 */
export async function POST(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  try {
    const admin = await requireAdmin(token);
    if (!admin) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

    revalidatePath("/");
    const content = await loadPortfolioContent();
    return Response.json({ ok: true, content });
  } catch (error) {
    console.error("[portfolio] refresh failed:", error);
    return Response.json({ ok: false, error: "server" }, { status: 500 });
  }
}
