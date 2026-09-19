import "server-only";

import { findResource } from "@/lib/admin/schema";
import type {
  PortfolioContent,
  PublicCredential,
  PublicLogEntry,
  PublicTestimonial,
  TestimonialPage,
} from "@/lib/portfolio/contract";

/**
 * Reads everything the public windows show from the tables the terminal CRUD
 * writes to. There is no second copy: what `projects new` saves is what the
 * Projects window lists.
 *
 * Only published rows are read, and only the columns a window renders, so a
 * draft or an internal timestamp never reaches the page.
 */

const EMPTY: PortfolioContent = {
  projects: [],
  skills: [],
  credentials: [],
  publications: [],
  changelog: [],
  career: [],
};

/** The same order the terminal's `list` uses, so the two views never disagree. */
function orderOf(resource: string) {
  return findResource(resource)?.orderBy ?? [];
}

/**
 * Values below end up inside href and src attributes and inside generated SVG.
 * The runtime escapes them as well; this makes sure a `javascript:` URL or a
 * colour that is really markup never gets that far.
 */
function httpUrl(value: string | null): string {
  const text = value?.trim() ?? "";
  return /^https?:\/\/\S+$/i.test(text) ? text : "";
}

/**
 * Photos are pasted as Google Drive links, and browsers refuse every Drive
 * form as an <img> (uc?export=view, /file/d/…/view, open?id=) even though
 * each one downloads fine outside a browser. Drive also serves the same file
 * from lh3.googleusercontent.com/d/<id>, which does load, so any Drive link is
 * rewritten to that. Anything else passes through httpUrl unchanged.
 */
function imageUrl(value: string | null): string {
  const url = httpUrl(value);
  const id =
    url.match(/^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)/)?.[1] ??
    url.match(/^https:\/\/drive\.google\.com\/(?:uc|open|thumbnail)\?(?:[^#]*&)?id=([\w-]+)/)?.[1];
  return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
}

function hexColor(value: string): string {
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ? value : "#000080";
}

/**
 * Splits the "Title | explanation" lines the admin form stores for solution
 * points, architecture layers and metrics. A line without a separator is all
 * heading, so nothing typed is ever dropped.
 */
function pairs(lines: string[] | null): { head: string; tail: string }[] {
  return (lines ?? []).map((line) => {
    const at = line.indexOf("|");
    return at < 0
      ? { head: line.trim(), tail: "" }
      : { head: line.slice(0, at).trim(), tail: line.slice(at + 1).trim() };
  });
}

function details(rows: [string, string | null][]): PublicCredential["details"] {
  return rows.filter((row): row is [string, string] => !!row[1]);
}

function logEntries(rows: { year: number; text: string }[]): PublicLogEntry[] {
  return rows.map(({ year, text }) => ({ year, text }));
}

/**
 * Without a DATABASE_URL there is nothing to read, and the windows show their
 * empty states. A configured database that fails is different: the error
 * propagates, so a failed regeneration keeps serving the last good page and a
 * failed build stops instead of shipping an empty portfolio.
 *
 * lib/prisma is imported here rather than at the top because it throws on
 * import when the variable is missing, and that case is handled here.
 */
async function database() {
  if (!process.env.DATABASE_URL) return null;
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

/**
 * Testimonial Express asks for one message at a time: page N with a limit of 1
 * is the Nth testimonial. A page past the end comes back empty rather than
 * clamped to the last one, which is how the inbox knows it has them all. The
 * id tiebreaker keeps the order stable when rows share a sort index and a
 * creation time, so no page repeats or skips an entry.
 */
export async function loadTestimonialPage(page: number, limit: number): Promise<TestimonialPage> {
  const prisma = await database();
  if (!prisma) return { items: [], page, limit, total: 0, pages: 0 };

  const where = { published: true };
  const [total, rows] = await Promise.all([
    prisma.testimonial.count({ where }),
    prisma.testimonial.findMany({
      where,
      orderBy: [...orderOf("testimonials"), { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        slug: true, author: true, role: true, subject: true, dateLabel: true, dateShort: true,
        stars: true, imageUrl: true, body: true,
      },
    }),
  ]);

  const items: PublicTestimonial[] = rows.map((t) => ({
    id: t.slug,
    from: t.author,
    role: t.role,
    subject: t.subject,
    date: t.dateLabel,
    dateShort: t.dateShort,
    stars: t.stars,
    avatar: imageUrl(t.imageUrl),
    text: t.body,
  }));
  return { items, page, limit, total, pages: Math.ceil(total / limit) };
}

export async function loadPortfolioContent(): Promise<PortfolioContent> {
  const prisma = await database();
  if (!prisma) {
    console.warn("[portfolio] DATABASE_URL is not set; public windows will be empty.");
    return EMPTY;
  }

  const published = { published: true };

  const [projects, skills, credentials, experience, education, publications, changelog, career] =
    await Promise.all([
      prisma.project.findMany({
        where: published,
        orderBy: orderOf("projects"),
        select: {
          slug: true, file: true, name: true, version: true, color: true, type: true, size: true,
          releaseDate: true, tagline: true, description: true, notes: true, stack: true,
          demoUrl: true, repoUrl: true, requirements: true,
          role: true, duration: true, team: true, problem: true, responsibilities: true, solution: true,
          architecture: true, architectureNote: true, result: true, metrics: true, captions: true,
        },
      }),
      prisma.skill.findMany({
        where: published,
        orderBy: orderOf("skills"),
        select: { slug: true, name: true, file: true, level: true, failing: true, group: true },
      }),
      prisma.credential.findMany({
        where: published,
        orderBy: orderOf("certificates"),
        select: { slug: true, kind: true, title: true, issuer: true, dateLabel: true, notes: true, verifyUrl: true },
      }),
      prisma.experience.findMany({
        where: published,
        orderBy: orderOf("experience"),
        select: {
          slug: true, role: true, company: true, location: true, employmentType: true,
          dateLabel: true, notes: true,
        },
      }),
      prisma.education.findMany({
        where: published,
        orderBy: orderOf("education"),
        select: { slug: true, degree: true, institution: true, field: true, dateLabel: true, notes: true },
      }),
      prisma.publication.findMany({
        where: published,
        orderBy: orderOf("publications"),
        select: {
          slug: true, title: true, venue: true, authors: true, dateLabel: true, doi: true, url: true,
          abstract: true, notes: true,
        },
      }),
      prisma.changelogEntry.findMany({
        where: published,
        orderBy: orderOf("changelog"),
        select: { year: true, text: true },
      }),
      prisma.careerEntry.findMany({
        where: published,
        orderBy: orderOf("career"),
        select: { year: true, text: true },
      }),
    ]);

  return {
    projects: projects.map((p) => ({
      id: p.slug,
      file: p.file,
      name: p.name,
      ver: p.version,
      color: hexColor(p.color),
      type: p.type,
      size: p.size,
      date: p.releaseDate,
      tagline: p.tagline,
      desc: p.description,
      notes: p.notes,
      stack: p.stack,
      demo: httpUrl(p.demoUrl),
      repo: httpUrl(p.repoUrl),
      req: p.requirements ?? "",
      caseStudy: {
        role: p.role ?? "",
        duration: p.duration ?? "",
        team: p.team ?? "",
        problem: p.problem ?? "",
        responsibilities: p.responsibilities ?? [],
        solution: pairs(p.solution).map(({ head, tail }) => ({ title: head, text: tail })),
        architecture: pairs(p.architecture).map(({ head, tail }) => ({ title: head, text: tail })),
        architectureNote: p.architectureNote ?? "",
        result: p.result ?? "",
        metrics: pairs(p.metrics).map(({ head, tail }) => ({ value: head, label: tail })),
        captions: p.captions ?? [],
      },
    })),
    skills: skills.map((s) => ({
      id: s.slug, name: s.name, file: s.file, level: s.level, fail: s.failing,
      ...(s.group ? { group: s.group } : {}),
    })),
    // One explorer window lists all four kinds, in this order.
    credentials: [
      ...credentials.map((c) => ({
        id: c.slug,
        kind: c.kind,
        title: c.title,
        issuer: c.issuer,
        date: c.dateLabel,
        notes: c.notes,
        url: httpUrl(c.verifyUrl),
        details: [],
      })),
      ...experience.map((e) => ({
        id: e.slug,
        kind: "experience" as const,
        title: e.role,
        issuer: e.company,
        date: e.dateLabel,
        notes: e.notes,
        url: "",
        details: details([["Location", e.location], ["Employment", e.employmentType]]),
      })),
      ...education.map((e) => ({
        id: e.slug,
        kind: "education" as const,
        title: e.degree,
        issuer: e.institution,
        date: e.dateLabel,
        notes: e.notes,
        url: "",
        details: details([["Field of study", e.field]]),
      })),
    ],
    publications: publications.map((p) => ({
      id: p.slug,
      title: p.title,
      venue: p.venue,
      authors: p.authors,
      date: p.dateLabel,
      doi: p.doi ?? "",
      url: httpUrl(p.url),
      abstract: p.abstract ?? "",
      notes: p.notes,
    })),
    changelog: logEntries(changelog),
    career: logEntries(career),
  };
}
