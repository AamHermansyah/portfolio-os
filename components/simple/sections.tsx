import { ContactForm } from "@/components/simple/contact-form";
import { ArrowUpRightIcon, MailIcon, StarIcon, WhatsAppIcon } from "@/components/simple/icons";
import { PixelIcon } from "@/components/simple/pixel-icon";
import { Win } from "@/components/simple/win";
import { fill, type Lang, type SimpleCopy } from "@/lib/i18n/simple";
import type {
  PublicCredential,
  PublicProfile,
  PublicSkill,
  PublicTestimonial,
} from "@/lib/portfolio/contract";

/* ---------- skills: the installer's progress bars ---------- */

export function Skills({ skills, copy }: { skills: PublicSkill[]; copy: SimpleCopy }) {
  const groups = new Map<string, PublicSkill[]>();
  for (const skill of skills.filter((s) => !s.fail)) {
    const key = skill.group ?? "";
    groups.set(key, [...(groups.get(key) ?? []), skill]);
  }

  return (
    <section className="sv-section" id="skills">
      <div className="sv-wrap">
        <header className="sv-head">
          <p className="sv-label">C:\PORTFOLIO\SKILLS.EXE</p>
          <h2>{copy.skillsTitle}</h2>
          <p>{copy.skillsIntro}</p>
        </header>
        <Win className="sv-skills" icon="gear" title={copy.winSkills}>
          <div className="sv-skill-groups">
            {[...groups.entries()].map(([group, items]) => (
              <div key={group || "other"}>
                {groups.size > 1 ? <h3>{group || copy.skillsOther}</h3> : null}
                <ul>
                  {items.map((skill) => (
                    <li key={skill.id}>
                      <span>{skill.name}</span>
                      <span
                        aria-label={fill(copy.skillsLevel, { name: skill.name, n: skill.level })}
                        className="sv-meter"
                        role="img"
                      >
                        <i style={{ width: `${Math.min(100, Math.max(0, skill.level))}%` }} />
                      </span>
                      <b>{skill.level}%</b>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Win>
      </div>
    </section>
  );
}

/* ---------- experience, education, certificates ---------- */

function CredentialList({ items, copy }: { items: PublicCredential[]; copy: SimpleCopy }) {
  return (
    <ul className="sv-timeline">
      {items.map((item) => (
        <li key={item.id}>
          <p className="sv-when">{item.date}</p>
          <h4>{item.title}</h4>
          <p className="sv-who">
            {item.issuer}
            {item.kind === "experience" && item.details.length > 0
              ? ` · ${item.details.map(([, value]) => value).join(" · ")}`
              : ""}
          </p>
          {item.notes.length > 0 ? (
            <ul className="sv-notes">
              {item.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
          {item.url ? (
            <a className="sv-link" href={item.url} rel="noopener" target="_blank">
              {copy.experienceVerify} <ArrowUpRightIcon size={13} />
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function Experience({ credentials, copy }: { credentials: PublicCredential[]; copy: SimpleCopy }) {
  const jobs = credentials.filter((c) => c.kind === "experience");
  const schools = credentials.filter((c) => c.kind === "education");
  const proofs = credentials.filter((c) => c.kind === "certificate" || c.kind === "award");

  return (
    <section className="sv-section" id="experience">
      <div className="sv-wrap">
        <header className="sv-head">
          <p className="sv-label">C:\PORTFOLIO\CAREER.LOG</p>
          <h2>{copy.experienceTitle}</h2>
        </header>
        <div className="sv-columns">
          {jobs.length > 0 ? (
            <Win icon="experience" title={copy.winExperience}>
              <CredentialList copy={copy} items={jobs} />
            </Win>
          ) : null}
          {schools.length > 0 ? (
            <Win icon="education" title={copy.winEducation}>
              <CredentialList copy={copy} items={schools} />
            </Win>
          ) : null}
          {proofs.length > 0 ? (
            <Win icon="cert" title={copy.winCerts}>
              <CredentialList copy={copy} items={proofs} />
            </Win>
          ) : null}
        </div>
        {jobs.length + schools.length + proofs.length === 0 ? <p className="sv-empty">{copy.experienceEmpty}</p> : null}
      </div>
    </section>
  );
}

/* ---------- testimonials: an inbox ---------- */

export function Words({ items, copy }: { items: PublicTestimonial[]; copy: SimpleCopy }) {
  if (items.length === 0) return null;

  return (
    <section className="sv-section" id="words">
      <div className="sv-wrap">
        <header className="sv-head">
          <p className="sv-label">INBOX</p>
          <h2>{copy.wordsTitle}</h2>
          <p>{copy.wordsIntro}</p>
        </header>
        <Win bare className="sv-inbox" icon="mail" title={copy.winInbox}>
          <ul className="sv-messages">
            {items.map((item) => (
              <li key={item.id}>
                <figure>
                  <figcaption>
                    {item.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" height={40} loading="lazy" referrerPolicy="no-referrer" src={item.avatar} width={40} />
                    ) : (
                      <PixelIcon name="person" size={40} />
                    )}
                    <span>
                      <strong>{item.from}</strong>
                      <small>{item.role}</small>
                    </span>
                    <span aria-label={fill(copy.wordsStars, { n: item.stars })} className="sv-stars" role="img">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <StarIcon filled={n <= item.stars} key={n} />
                      ))}
                    </span>
                  </figcaption>
                  <blockquote>{item.text}</blockquote>
                </figure>
              </li>
            ))}
          </ul>
        </Win>
      </div>
    </section>
  );
}

/* ---------- contact ---------- */

export function Contact({ lang, copy, profile, chat }: { lang: Lang; copy: SimpleCopy; profile: PublicProfile; chat: string }) {
  const { links } = profile;

  return (
    <section className="sv-section" id="contact">
      <div className="sv-wrap sv-contact">
        <div className="sv-contact-text">
          <p className="sv-label">C:\PORTFOLIO\CONTACT.EXE</p>
          <h2>{copy.contactTitle}</h2>
          <p className="sv-lead">{copy.contactLead}</p>
          <div className="sv-cta">
            <a className="sv-btn sv-btn-primary" href={chat} rel="noopener" target="_blank">
              <WhatsAppIcon />
              {copy.heroWhatsapp}
            </a>
            <a className="sv-btn" href={`mailto:${links.email}`}>
              <MailIcon />
              {links.email}
            </a>
          </div>
          <p className="sv-elsewhere">
            <span>{copy.contactElsewhere}</span>
            <a className="sv-link" href={links.linkedin} rel="noopener" target="_blank">
              LinkedIn
            </a>
            <a className="sv-link" href={links.github} rel="noopener" target="_blank">
              GitHub
            </a>
            <a className="sv-link" href={links.fiverr} rel="noopener" target="_blank">
              Fiverr
            </a>
          </p>
        </div>
        <Win className="sv-message" icon="openmail" title={copy.winMessage}>
          <ContactForm copy={copy} email={links.email} lang={lang} whatsapp={links.whatsapp} />
        </Win>
      </div>
    </section>
  );
}
