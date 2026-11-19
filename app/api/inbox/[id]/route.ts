import { NextResponse, type NextRequest } from "next/server";

import { inboxAdmin, isInboxKind, isSameOrigin, openSubmission, unreadCounts } from "@/lib/admin/inbox";

/**
 * PATCH /api/inbox/:id?kind=hire|contact — marks one submission as read.
 *
 * Reading is the only write the Mailbox cookie allows. The id is looked up
 * inside the chosen kind, so a Hire_Me id cannot be opened as a Contact one.
 */
const NO_STORE = { "Cache-Control": "no-store" };

function reply(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/inbox/[id]">) {
  if (!isSameOrigin(request)) return reply({ ok: false, error: "forbidden" }, 403);

  try {
    if (!(await inboxAdmin(request))) return reply({ ok: false, error: "unauthorized" }, 401);

    const kind = request.nextUrl.searchParams.get("kind");
    if (!isInboxKind(kind)) return reply({ ok: false, error: "unknown_kind" }, 400);

    const { id } = await ctx.params;
    const item = await openSubmission(kind, id);
    if (!item) return reply({ ok: false, error: "not_found" }, 404);

    return reply({ ok: true, item, unread: await unreadCounts() });
  } catch (error) {
    console.error("[inbox] mark read failed:", error);
    return reply({ ok: false, error: "server" }, 500);
  }
}
