import "server-only";

import type { NextRequest, NextResponse } from "next/server";

import { requireInbox, type InboxSession } from "@/lib/admin/auth";
import { getRow, listRows } from "@/lib/admin/crud";
import { findResource } from "@/lib/admin/schema";
import { INBOX_TTL_MS } from "@/lib/admin/token";
import { prisma } from "@/lib/prisma";

/**
 * Everything the Mailbox app needs from the server: the session cookie, the
 * checks that guard it, and the queries behind the window.
 *
 * The cookie is what lets the owner sign in once and keep reading Hire_Me and
 * Contact submissions for weeks. It is HttpOnly, so the page's own JavaScript —
 * and anything injected into it — can never read the token, and SameSite=Strict
 * so another site cannot make the browser send it. It authorizes reading
 * submissions and marking them read, and nothing else: the terminal's content
 * CRUD takes a bearer token and rejects this one (see lib/admin/auth.ts).
 */

export const INBOX_COOKIE = "portfolioos_inbox";

export type InboxKind = "hire" | "contact";

export function isInboxKind(value: unknown): value is InboxKind {
  return value === "hire" || value === "contact";
}

/** Behind Vercel the request reaches the handler as https; locally it is plain http. */
function isSecure(request: NextRequest): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  return (forwarded ?? new URL(request.url).protocol.replace(":", "")) === "https";
}

export function setInboxCookie(response: NextResponse, request: NextRequest, session: InboxSession): void {
  response.cookies.set({
    name: INBOX_COOKIE,
    value: session.token,
    httpOnly: true,
    secure: isSecure(request),
    sameSite: "strict",
    path: "/",
    maxAge: Math.floor(INBOX_TTL_MS / 1000),
  });
}

export function clearInboxCookie(response: NextResponse, request: NextRequest): void {
  response.cookies.set({
    name: INBOX_COOKIE,
    value: "",
    httpOnly: true,
    secure: isSecure(request),
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

/**
 * SameSite=Strict already keeps another site's requests from carrying the
 * cookie; this is the second lock, for browsers that predate it. Browsers send
 * `Sec-Fetch-Site` on every fetch, and `Origin` on every non-GET one.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === request.nextUrl.host;
    } catch {
      return false;
    }
  }
  // A non-browser caller sends neither header, and cannot have the cookie anyway.
  return true;
}

/** The signed-in owner for this request, or null. */
export async function inboxAdmin(request: NextRequest) {
  const token = request.cookies.get(INBOX_COOKIE)?.value;
  return token ? requireInbox(token) : null;
}

function specFor(kind: InboxKind) {
  const spec = findResource(kind);
  if (!spec) throw new Error(`Missing resource ${kind}`);
  return spec;
}

/** Unread counts for both tabs, which is what the desktop icon's badge shows. */
export async function unreadCounts(): Promise<Record<InboxKind, number>> {
  const [hire, contact] = await Promise.all([
    prisma.inquiry.count({ where: { kind: "inquiry", readAt: null } }),
    prisma.inquiry.count({ where: { kind: "message", readAt: null } }),
  ]);
  return { hire, contact };
}

export async function listInbox(kind: InboxKind, page: number, pageSize: number) {
  return listRows(specFor(kind), page, pageSize);
}

/** Opening a submission is what marks it read, exactly as in the terminal. */
export async function openSubmission(kind: InboxKind, id: string) {
  return getRow(specFor(kind), id);
}
