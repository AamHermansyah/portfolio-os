import { NextResponse, type NextRequest } from "next/server";

import { inboxAdmin, isInboxKind, listInbox, unreadCounts } from "@/lib/admin/inbox";

/**
 * GET /api/inbox?kind=hire|contact&page=N — the Mailbox window's list, plus the
 * unread count for both tabs. Authorized by the session cookie alone.
 *
 * Without `kind` it answers with the unread counts only, which is all the
 * desktop icon's badge needs. Never cached: the answer is private and changes
 * whenever a visitor writes in.
 */
const NO_STORE = { "Cache-Control": "no-store" };
const PAGE_SIZE = 25;
const MAX_PAGE = 10_000;

function reply(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function GET(request: NextRequest) {
  try {
    if (!(await inboxAdmin(request))) return reply({ ok: false, error: "unauthorized" }, 401);

    const params = request.nextUrl.searchParams;
    const kind = params.get("kind");
    const pageNumber = Number(params.get("page"));
    const page = Number.isInteger(pageNumber) && pageNumber >= 1 ? Math.min(pageNumber, MAX_PAGE) : 1;

    const unread = await unreadCounts();
    if (kind === null) return reply({ ok: true, unread });
    if (!isInboxKind(kind)) return reply({ ok: false, error: "unknown_kind" }, 400);

    const { rows, total, pages, page: current } = await listInbox(kind, page, PAGE_SIZE);
    return reply({ ok: true, kind, items: rows, total, pages, page: current, unread });
  } catch (error) {
    console.error("[inbox] list failed:", error);
    return reply({ ok: false, error: "server" }, 500);
  }
}
