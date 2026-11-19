import { Hero } from "@/components/simple/hero";
import { PixelIcon } from "@/components/simple/pixel-icon";
import { Contact, Experience, Skills, Words } from "@/components/simple/sections";
import { Work } from "@/components/simple/work";
import type { Lang, SimpleCopy } from "@/lib/i18n/simple";
import type { PortfolioContent, PublicProfile, PublicTestimonial } from "@/lib/portfolio/contract";

/**
 * The portfolio as an ordinary page: the same work as the desktop, without the
 * desktop — but still dressed as it, so a visitor who moves between the two meets
 * one place. Server-rendered end to end; the only client code is the contact form.
 *
 * The header is the desktop's taskbar and every block is one of its windows.
 */

type Props = {
  lang: Lang;
  copy: SimpleCopy;
  profile: PublicProfile;
  content: PortfolioContent;
  testimonials: PublicTestimonial[];
  /** Current year for the footer, passed in so the render itself stays pure. */
  year: number;
};

export function SimpleView({ lang, copy, profile, content, testimonials, year }: Props) {
  const text = { ...profile, ...(lang === "id" ? profile.i18n.id : {}) };
  const other: Lang = lang === "en" ? "id" : "en";
  const chat = `${profile.links.whatsapp}?text=${encodeURIComponent(copy.heroWhatsappText)}`;

  return (
    <>
      <a className="sv-skip" href="#main">
        {copy.skip}
      </a>

      <header className="sv-taskbar">
        <div className="sv-wrap sv-taskbar-row">
          <a className="sv-start" href="#top">
            <PixelIcon name="computer" size={22} />
            <span>{profile.name}</span>
          </a>
          <nav aria-label={copy.navLabel} className="sv-nav">
            <a href="#work">{copy.navWork}</a>
            <a href="#skills">{copy.navSkills}</a>
            <a href="#experience">{copy.navExperience}</a>
            {testimonials.length > 0 ? <a href="#words">{copy.navWords}</a> : null}
            <a href="#contact">{copy.navContact}</a>
          </nav>
          <div className="sv-tray">
            <a
              aria-label={`${copy.language}: ${other === "en" ? "English" : "Bahasa Indonesia"}`}
              className="sv-lang"
              hrefLang={other}
              href={`/${other}`}
            >
              {other.toUpperCase()}
            </a>
            {/* A plain link, not <Link>: this crosses to the other root layout. */}
            <a className="sv-desktop" href={`/?lang=${lang}`}>
              {copy.desktopShort}
            </a>
          </div>
        </div>
      </header>

      <main id="main">
        <Hero chat={chat} copy={copy} hasWords={testimonials.length > 0} profile={profile} text={text} />
        <Work copy={copy} projects={content.projects} />
        <Skills copy={copy} skills={content.skills} />
        <Experience copy={copy} credentials={content.credentials} />
        <Words copy={copy} items={testimonials} />
        <Contact chat={chat} copy={copy} lang={lang} profile={profile} />
      </main>

      <footer className="sv-footer">
        <div className="sv-wrap sv-footer-row">
          <p>
            © {year} {profile.name}. {copy.footerRights}
          </p>
          <p>
            {copy.footerDesktop} <a className="sv-link" href={`/?lang=${lang}`}>{copy.desktop}</a>
          </p>
        </div>
      </footer>
    </>
  );
}
