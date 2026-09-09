import { connection } from "next/server";

/**
 * Inquiries from Hire_Me.exe (`kind: "inquiry"`) and Contact.exe (`kind: "message"`).
 *
 * The transport is whatever the deployment configures, so the portfolio can be
 * cloned and pointed at any inbox without touching this file:
 *
 *   HIRE_WEBHOOK_URL  any endpoint that accepts JSON (Formspree, Web3Forms,
 *                     Slack, Discord, Zapier, n8n...)
 *   RESEND_API_KEY    + HIRE_TO_EMAIL (+ optional HIRE_FROM_EMAIL) to send mail
 *
 * With neither set the route answers `not_configured` rather than pretending to
 * have delivered anything, and the UI falls back to opening the visitor's mail
 * client. That fallback is the old mailto: path — kept as a safety net, no
 * longer the only way a message can reach anyone.
 */

const FIELD_LIMITS = {
  engagement: 60,
  projectType: 80,
  budget: 60,
  timeline: 60,
  name: 80,
  email: 120,
  company: 80,
  subject: 140,
  message: 4000,
} as const;

type Field = keyof typeof FIELD_LIMITS;
type Kind = "inquiry" | "message";

const REQUIRED_BY_KIND: Record<Kind, Field[]> = {
  inquiry: ["engagement", "projectType", "budget", "timeline", "name", "email"],
  message: ["name", "email", "message"],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A form filled faster than this was not filled by a person. */
const MIN_FILL_MS = 2000;

/**
 * In-memory throttle. It resets on redeploy and is per-instance, so it is a
 * speed bump for casual abuse rather than a security boundary — pair it with a
 * provider-side limit if this ever gets real traffic.
 */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const recentHits = new Map<string, number[]>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

function overRateLimit(key: string): boolean {
  const now = Date.now();
  const hits = (recentHits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  recentHits.set(key, hits);
  if (recentHits.size > 500) {
    for (const [k, times] of recentHits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) recentHits.delete(k);
    }
  }
  return hits.length > RATE_MAX;
}

function configuredTransport(): "webhook" | "resend" | null {
  if (process.env.HIRE_WEBHOOK_URL) return "webhook";
  if (process.env.RESEND_API_KEY && process.env.HIRE_TO_EMAIL) return "resend";
  return null;
}

function readField(raw: unknown, field: Field): string {
  return typeof raw === "string" ? raw.trim().slice(0, FIELD_LIMITS[field]) : "";
}

function summarise(kind: Kind, values: Record<Field, string>, source: string): string {
  const row = (label: string, value: string) => `${label.padEnd(11)}: ${value}`;
  const lines =
    kind === "inquiry"
      ? [
          `New inquiry from PortfolioOS — ${source}`,
          "",
          row("Engagement", values.engagement),
          row("Focus", values.projectType),
          row("Budget", values.budget),
          row("Timeline", values.timeline),
          "",
          row("Name", values.name),
          row("E-mail", values.email),
        ]
      : [
          `New message from PortfolioOS — ${source}`,
          "",
          row("Name", values.name),
          row("E-mail", values.email),
        ];

  if (values.company) lines.push(row("Company", values.company));
  if (kind === "message" && values.subject) lines.push(row("Subject", values.subject));
  if (values.message) lines.push("", "Message:", values.message);
  return lines.join("\n");
}

function subjectLine(kind: Kind, values: Record<Field, string>, source: string): string {
  return kind === "inquiry"
    ? `${source}: ${values.engagement} — ${values.name}`
    : `${source}: ${values.subject || "Message"} — ${values.name}`;
}

async function deliver(
  kind: Kind,
  values: Record<Field, string>,
  source: string,
  summary: string,
): Promise<void> {
  const webhook = process.env.HIRE_WEBHOOK_URL;
  if (webhook) {
    // `text` suits Slack and most form services, `content` is what Discord reads.
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        kind,
        source,
        receivedAt: new Date().toISOString(),
        text: summary,
        content: summary,
      }),
    });
    if (!response.ok) throw new Error(`webhook responded ${response.status}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.HIRE_FROM_EMAIL || "PortfolioOS <onboarding@resend.dev>",
      to: [process.env.HIRE_TO_EMAIL],
      reply_to: values.email,
      subject: subjectLine(kind, values, source),
      text: summary,
    }),
  });
  if (!response.ok) throw new Error(`resend responded ${response.status}`);
}

/** Lets the wizard word its final step honestly before anyone fills it in. */
export async function GET() {
  await connection();
  return Response.json({ ok: true, configured: configuredTransport() !== null });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const input = (body ?? {}) as Record<string, unknown>;

  // Bots fill every input they find, including the one no human can see.
  if (readField(input.website, "company")) {
    return Response.json({ ok: true, skipped: true });
  }

  const elapsed = typeof input.elapsedMs === "number" ? input.elapsedMs : 0;
  if (elapsed < MIN_FILL_MS) {
    return Response.json({ ok: false, error: "too_fast" }, { status: 400 });
  }

  const kind: Kind = input.kind === "message" ? "message" : "inquiry";
  const values = Object.fromEntries(
    (Object.keys(FIELD_LIMITS) as Field[]).map((field) => [field, readField(input[field], field)]),
  ) as Record<Field, string>;

  const missing = REQUIRED_BY_KIND[kind].filter((field) => !values[field]);
  if (missing.length > 0) {
    return Response.json({ ok: false, error: "validation", fields: missing }, { status: 400 });
  }
  if (!EMAIL_RE.test(values.email)) {
    return Response.json({ ok: false, error: "validation", fields: ["email"] }, { status: 400 });
  }

  if (overRateLimit(clientKey(request))) {
    return Response.json({ ok: false, error: "rate_limit" }, { status: 429 });
  }

  if (configuredTransport() === null) {
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const source = readField(input.source, "subject") || (kind === "inquiry" ? "Hire_Me.exe" : "Contact.exe");
  try {
    await deliver(kind, values, source, summarise(kind, values, source));
  } catch (error) {
    console.error("[hire] delivery failed:", error);
    return Response.json({ ok: false, error: "transport" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
