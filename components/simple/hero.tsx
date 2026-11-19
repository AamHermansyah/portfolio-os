import { DownloadIcon, MailIcon, WhatsAppIcon } from "@/components/simple/icons";
import { PixelIcon } from "@/components/simple/pixel-icon";
import { Win } from "@/components/simple/win";
import { fill, type SimpleCopy } from "@/lib/i18n/simple";
import type { ProfileText, PublicProfile } from "@/lib/portfolio/contract";
import type { PixelIconName } from "@/lib/simple/pixel-art";

type Props = {
  copy: SimpleCopy;
  profile: PublicProfile;
  /** The profile's text fields in the page's language. */
  text: ProfileText;
  chat: string;
  /** Show the Testimonials shortcut only when there is something behind it. */
  hasWords: boolean;
};

/** Where each desktop-style shortcut goes. The icons are the desktop's own. */
const SHORTCUTS: { href: string; icon: PixelIconName; label: keyof SimpleCopy }[] = [
  { href: "#work", icon: "folder", label: "navWork" },
  { href: "#skills", icon: "gear", label: "navSkills" },
  { href: "#experience", icon: "experience", label: "navExperience" },
  { href: "#words", icon: "mail", label: "navWords" },
  { href: "#contact", icon: "openmail", label: "navContact" },
];

export function Hero({ copy, profile, text, chat, hasWords }: Props) {
  const { links } = profile;
  const frame = profile.photoFocus;
  const facts: [string, string][] = [
    [copy.factLocation, text.location],
    [copy.factExperience, text.experience],
    [copy.factStatus, text.status],
    [copy.factLanguages, text.languages],
  ];

  return (
    <section className="sv-hero" id="top">
      <div className="sv-wrap sv-hero-grid">
        <div className="sv-hero-main">
          <p className="sv-kicker" data-enter style={{ "--d": "0ms" } as React.CSSProperties}>
            C:\PORTFOLIO&gt; whoami
          </p>
          <h1 data-enter style={{ "--d": "80ms" } as React.CSSProperties}>
            {profile.name}
            <span>{text.role}</span>
          </h1>
          <p className="sv-lead" data-enter style={{ "--d": "180ms" } as React.CSSProperties}>
            {copy.heroLine}
          </p>
          <div className="sv-cta" data-enter style={{ "--d": "280ms" } as React.CSSProperties}>
            <a className="sv-btn sv-btn-primary" href={chat} rel="noopener" target="_blank">
              <WhatsAppIcon />
              {copy.heroWhatsapp}
            </a>
            <a className="sv-btn" href={`mailto:${links.email}`}>
              <MailIcon />
              {copy.heroEmail}
            </a>
            <a className="sv-btn" download="Aam-Hermansyah-CV.pdf" href="/resume.pdf">
              <DownloadIcon />
              {copy.heroCv}
            </a>
          </div>
        </div>

        <div className="sv-hero-side" data-enter style={{ "--d": "140ms" } as React.CSSProperties}>
          <Win className="sv-about" icon="txt" title={copy.winAbout}>
            <div className="sv-about-top">
              <div className="sv-photo">
                {/* The photo is a Drive file addressed by URL, outside next/image's loaders. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={fill(copy.heroPhotoAlt, { name: profile.name })}
                  height={160}
                  referrerPolicy="no-referrer"
                  src={profile.photo}
                  style={{
                    objectPosition: `${frame.x}% ${frame.y}%`,
                    transform: `scale(${frame.zoom})`,
                    transformOrigin: `${frame.x}% ${frame.y}%`,
                  }}
                  width={160}
                />
              </div>
              <dl className="sv-facts">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="sv-summary">{text.summary}</p>
            {profile.available ? (
              <p className="sv-status">
                <span aria-hidden="true" className="sv-dot" />
                {text.status}
              </p>
            ) : null}
            <p className="sv-rating">{text.additional}</p>
          </Win>
        </div>
      </div>

      <nav aria-label={copy.heroShortcuts} className="sv-wrap sv-icons" data-enter style={{ "--d": "360ms" } as React.CSSProperties}>
        {SHORTCUTS.filter((item) => item.href !== "#words" || hasWords).map((item) => (
          <a className="sv-icon" href={item.href} key={item.href}>
            <PixelIcon name={item.icon} size={40} />
            <span>{copy[item.label]}</span>
          </a>
        ))}
      </nav>
    </section>
  );
}
