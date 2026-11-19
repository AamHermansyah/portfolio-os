"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { WhatsAppIcon } from "@/components/simple/icons";
import { fill, type Lang, type SimpleCopy } from "@/lib/i18n/simple";

/**
 * A short message form for visitors who would rather not open the desktop.
 *
 * It posts to the same /api/hire the desktop's Contact.exe uses, so what is sent
 * lands in the Mailbox like any other message. The honeypot field and the
 * elapsed-time value are what that route uses to turn spam away.
 */

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; name: string }
  | { kind: "error"; text: string; mailto?: string };

type Props = {
  lang: Lang;
  copy: SimpleCopy;
  whatsapp: string;
  email: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm({ lang, copy, whatsapp, email }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // The route refuses a form filled in under two seconds. Time is read when the
  // form mounts, not during render, which keeps the render itself pure.
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "sending") return;

    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    const name = text("name");
    const from = text("email");
    const message = text("message");

    if (!name || !from || !message) return setStatus({ kind: "error", text: copy.errRequired });
    if (!EMAIL_PATTERN.test(from)) return setStatus({ kind: "error", text: copy.errEmail });

    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "message",
          source: `Simple view (${lang})`,
          name,
          email: from,
          // The Mailbox lists messages by subject, so the first line stands in for one.
          subject: message.split("\n")[0].slice(0, 80),
          message,
          elapsedMs: Date.now() - mountedAt.current,
          website: text("website"),
        }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (response.ok && data?.ok) return setStatus({ kind: "sent", name });

      switch (data?.error) {
        case "too_fast":
          return setStatus({ kind: "error", text: copy.errTooFast });
        case "rate_limit":
          return setStatus({ kind: "error", text: copy.errRate });
        case "validation":
          return setStatus({ kind: "error", text: copy.errEmail });
        case "not_configured":
          return setStatus({
            kind: "error",
            text: copy.errNotConfigured,
            mailto: `mailto:${email}?subject=${encodeURIComponent(fill(copy.mailSubject, { name }))}&body=${encodeURIComponent(message)}`,
          });
        default:
          return setStatus({ kind: "error", text: copy.errServer });
      }
    } catch {
      return setStatus({ kind: "error", text: copy.errNetwork });
    }
  }

  if (status.kind === "sent") {
    const chat = `${whatsapp}?text=${encodeURIComponent(fill(copy.formWhatsappMessage, { name: status.name }))}`;
    return (
      <div className="sv-sent" role="status">
        <h3>{copy.formSentTitle}</h3>
        <p>{copy.formSentBody}</p>
        <a className="sv-btn sv-btn-primary" href={chat} rel="noopener" target="_blank">
          <WhatsAppIcon />
          {copy.formWhatsapp}
        </a>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form className="sv-form" noValidate onSubmit={onSubmit}>
      <label className="sv-field">
        <span>{copy.formName}</span>
        <input autoComplete="name" maxLength={120} name="name" required type="text" />
      </label>
      <label className="sv-field">
        <span>{copy.formEmail}</span>
        <input autoComplete="email" maxLength={200} name="email" required spellCheck={false} type="email" />
      </label>
      <label className="sv-field">
        <span>{copy.formMessage}</span>
        <textarea maxLength={4000} name="message" required rows={5} />
      </label>
      {/* Left empty by people; filled in by form-stuffing bots. */}
      <input aria-hidden="true" autoComplete="off" className="sv-hp" name="website" tabIndex={-1} type="text" />

      {status.kind === "error" ? (
        <p className="sv-error" role="alert">
          {status.text}{" "}
          {status.mailto ? (
            <a href={status.mailto}>{copy.formMailFallback}</a>
          ) : null}
        </p>
      ) : null}

      <button className="sv-btn sv-btn-primary" disabled={sending} type="submit">
        {sending ? `${copy.formSending}…` : copy.formSend}
      </button>
    </form>
  );
}
