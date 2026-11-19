import { NextResponse, type NextRequest } from "next/server";

import { mintInboxSession } from "@/lib/admin/auth";
import {
  clearInboxCookie,
  INBOX_COOKIE,
  inboxAdmin,
  isSameOrigin,
  setInboxCookie,
} from "@/lib/admin/inbox";

/**
 * The Mailbox session cookie.
 *
 * POST   trades a fresh terminal token for the cookie. The terminal calls it
 *        right after a successful sign-in, so the owner types the password once.
 * GET    says whether the cookie is still good, and quietly renews it once more
 *        than half its lifetime is gone.
 * DELETE ends it.
 *
 * Cookies are set here, in a Route Handler, because a Server Action that sets
 * one answers with an RSC re-render the plain-script runtime cannot apply
 * (see app/actions/admin-auth.ts).
 */

const NO_STORE = { "Cache-Control": "no-store" };

function reply(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function GET(request: NextRequest) {
  try {
    const admin = await inboxAdmin(request);

    if (!admin) {
      const response = reply({ ok: true, signedIn: false });
      // A cookie that no longer verifies is dropped, so it is not sent forever.
      if (request.cookies.has(INBOX_COOKIE)) clearInboxCookie(response, request);
      return response;
    }

    const response = reply({
      ok: true,
      signedIn: true,
      username: admin.username,
      expiresAt: admin.renewal?.expiresAt ?? admin.expiresAt,
    });
    if (admin.renewal) setInboxCookie(response, request, admin.renewal);
    return response;
  } catch (error) {
    console.error("[inbox] session check failed:", error);
    return reply({ ok: false, error: "server" }, 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return reply({ ok: false, error: "forbidden" }, 403);

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  try {
    const session = await mintInboxSession(token);
    if (!session) return reply({ ok: false, error: "unauthorized" }, 401);

    const response = reply({
      ok: true,
      signedIn: true,
      username: session.username,
      expiresAt: session.expiresAt,
    });
    setInboxCookie(response, request, session);
    return response;
  } catch (error) {
    console.error("[inbox] session start failed:", error);
    return reply({ ok: false, error: "server" }, 500);
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return reply({ ok: false, error: "forbidden" }, 403);

  const response = reply({ ok: true, signedIn: false });
  clearInboxCookie(response, request);
  return response;
}
