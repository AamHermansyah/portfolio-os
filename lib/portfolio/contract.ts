/**
 * The public content the PortfolioOS windows render, as it crosses from the
 * server to the browser runtime.
 *
 * The field names are the ones runtime/portfolio-os already used for its
 * hardcoded arrays (`ver`, `desc`, `demo`, `from`, `avatar` …), so the windows
 * read database rows without learning a second vocabulary. The mapping from
 * column names happens once, in lib/portfolio/content.ts.
 *
 * Like lib/admin/contract.ts, this module imports nothing and is safe on both
 * sides of the boundary.
 */

/**
 * The material behind a project's Challenge, Solution, Architecture, Results
 * and Preview tabs. Every part may be empty; the window shows an empty state
 * for a tab with nothing in it rather than hiding the tab.
 */
export type PublicCaseStudy = {
  role: string;
  duration: string;
  team: string;
  problem: string;
  responsibilities: string[];
  solution: { title: string; text: string }[];
  architecture: { title: string; text: string }[];
  architectureNote: string;
  result: string;
  metrics: { value: string; label: string }[];
  /** One per generated preview screenshot. */
  captions: string[];
};

export type PublicProject = {
  /** The row's slug; also the window id and the case-study key. */
  id: string;
  file: string;
  name: string;
  ver: string;
  /** Always a hex colour — it is interpolated into generated SVG. */
  color: string;
  type: string;
  size: string;
  date: string;
  tagline: string;
  desc: string;
  notes: string[];
  stack: string[];
  /** Empty when absent. Only http(s) URLs survive. */
  demo: string;
  repo: string;
  req: string;
  caseStudy: PublicCaseStudy;
};

export type PublicSkill = {
  id: string;
  name: string;
  file: string;
  level: number;
  fail: boolean;
  group?: string;
};

export type PublicTestimonial = {
  id: string;
  from: string;
  role: string;
  subject: string;
  date: string;
  dateShort: string;
  stars: number;
  avatar: string;
  text: string;
};

/**
 * Certificates, awards, work history and education share one explorer window,
 * so they share one shape. `details` carries the rows that only some kinds
 * have, such as a location or a field of study.
 */
export type PublicCredential = {
  id: string;
  kind: "certificate" | "award" | "experience" | "education";
  title: string;
  issuer: string;
  date: string;
  notes: string[];
  url: string;
  details: [label: string, value: string][];
};

export type PublicPublication = {
  id: string;
  title: string;
  venue: string;
  authors: string[];
  date: string;
  doi: string;
  url: string;
  abstract: string;
  notes: string[];
};

export type PublicLogEntry = {
  year: number;
  text: string;
};

/**
 * One page of GET /api/testimonials. Testimonials are not part of
 * PortfolioContent: Testimonial Express fetches them one at a time, page N
 * with a limit of 1 being the Nth message.
 */
export type TestimonialPage = {
  items: PublicTestimonial[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type PortfolioContent = {
  projects: PublicProject[];
  skills: PublicSkill[];
  credentials: PublicCredential[];
  publications: PublicPublication[];
  /** Changelog.log — the shipping history of PortfolioOS itself. */
  changelog: PublicLogEntry[];
  /** Career.log — the professional timeline. */
  career: PublicLogEntry[];
};
