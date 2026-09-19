/**
 * One description of every manageable resource, shared by the validator, the
 * generic CRUD layer and the terminal prompts.
 *
 * Writing eleven hand-rolled create/edit paths would have meant eleven places
 * to forget a length cap. Describing the fields once and driving everything off
 * that description means a new resource is a table entry, not a feature.
 */

export type FieldType = "string" | "text" | "int" | "bool" | "list" | "enum" | "date";

export type FieldSpec = {
  name: string;
  label: string;
  type: FieldType;
  /** Absent means required. */
  optional?: boolean;
  /** Character cap for string/text, item cap for list. */
  max?: number;
  /** Inclusive bounds for int. */
  min?: number;
  ceiling?: number;
  /** Allowed values for enum. */
  options?: string[];
  /** Shown under the prompt when the format is not obvious. */
  hint?: string;
  /** Default applied when the field is left blank on create. */
  fallback?: string | number | boolean;
  /** Id of an optional section in ResourceSpec.groups; the form hides it until asked. */
  group?: string;
};

/**
 * An optional block of fields. The form window shows a button in its place and
 * reveals the fields only when asked; closing it again sends none of them, so
 * a create leaves them empty and an edit leaves the stored values untouched.
 */
export type FieldGroup = {
  id: string;
  label: string;
  hint?: string;
};

export type ResourceSpec = {
  id: string;
  label: string;
  /** Key of the Prisma delegate, e.g. "credential" for prisma.credential. */
  model: string;
  /** Columns shown by `list`, in order. */
  columns: { field: string; width: number; header: string }[];
  fields: FieldSpec[];
  groups?: FieldGroup[];
  orderBy: Record<string, "asc" | "desc">[];
  /** Fixed filter, so contact and hire can share the Inquiry table. */
  where?: Record<string, unknown>;
  /** Field whose value seeds the unique slug. Omit when the model has no slug. */
  slugFrom?: string;
  /** Submissions are received, never authored: list, read and delete only. */
  readOnly?: boolean;
};

const PUBLISHING: FieldSpec[] = [
  { name: "published", label: "Published", type: "bool", optional: true, fallback: true },
  { name: "sortIndex", label: "Sort index", type: "int", optional: true, fallback: 0, hint: "lower shows first" },
];

const NOTES: FieldSpec = {
  name: "notes",
  label: "Notes",
  type: "list",
  optional: true,
  max: 20,
  hint: "one per line, blank line ends",
};

/** Every field optional: a project may have all, some or none of its case study. */
const CASE_STUDY_FIELDS: FieldSpec[] = [
  { name: "role", label: "My role", type: "string", optional: true, max: 80, hint: "e.g. Fullstack Developer" },
  { name: "duration", label: "Duration", type: "string", optional: true, max: 60, hint: "e.g. 3 months" },
  { name: "team", label: "Team", type: "string", optional: true, max: 80, hint: "e.g. 2 engineers, 1 designer" },
  { name: "problem", label: "Challenge", type: "text", optional: true, max: 2000 },
  { name: "responsibilities", label: "Responsibilities", type: "list", optional: true, max: 20, hint: "one per line" },
  { name: "solution", label: "Solution points", type: "list", optional: true, max: 12, hint: "one per line: Title | explanation" },
  { name: "architecture", label: "Architecture", type: "list", optional: true, max: 12, hint: "one per line: Layer | responsibility" },
  { name: "architectureNote", label: "Engineering note", type: "text", optional: true, max: 600 },
  { name: "result", label: "Results", type: "text", optional: true, max: 2000 },
  { name: "metrics", label: "Metrics", type: "list", optional: true, max: 6, hint: "one per line: value | label, e.g. 40% | faster checkout" },
  { name: "captions", label: "Preview captions", type: "list", optional: true, max: 6, hint: "one generated screenshot per caption" },
];

const CASE_STUDY = CASE_STUDY_FIELDS.map((field) => ({ ...field, group: "caseStudy" }));

export const RESOURCES: ResourceSpec[] = [
  {
    id: "certificates",
    label: "Certificates and awards",
    model: "credential",
    slugFrom: "title",
    orderBy: [{ sortIndex: "asc" }, { createdAt: "desc" }],
    columns: [
      { field: "kind", width: 12, header: "KIND" },
      { field: "title", width: 38, header: "TITLE" },
      { field: "dateLabel", width: 16, header: "DATE" },
    ],
    fields: [
      { name: "kind", label: "Kind", type: "enum", options: ["certificate", "award"], fallback: "certificate" },
      { name: "title", label: "Title", type: "string", max: 160 },
      { name: "issuer", label: "Issuer", type: "string", max: 120 },
      { name: "dateLabel", label: "Date label", type: "string", max: 40, hint: "free text, e.g. 2024" },
      { name: "issuedOn", label: "Issued on", type: "date", optional: true, hint: "YYYY-MM-DD, optional" },
      { name: "verifyUrl", label: "Verify URL", type: "string", optional: true, max: 500 },
      NOTES,
      ...PUBLISHING,
    ],
  },
  {
    id: "publications",
    label: "Journals, conferences and papers",
    model: "publication",
    slugFrom: "title",
    orderBy: [{ sortIndex: "asc" }, { createdAt: "desc" }],
    columns: [
      { field: "title", width: 40, header: "TITLE" },
      { field: "venue", width: 24, header: "VENUE" },
      { field: "dateLabel", width: 14, header: "DATE" },
    ],
    fields: [
      { name: "title", label: "Title", type: "string", max: 240 },
      { name: "venue", label: "Venue", type: "string", max: 160, hint: "journal, conference or publisher" },
      { name: "authors", label: "Authors", type: "list", max: 30, hint: "one per line, in credit order" },
      { name: "dateLabel", label: "Date label", type: "string", max: 40 },
      { name: "publishedOn", label: "Published on", type: "date", optional: true, hint: "YYYY-MM-DD, optional" },
      { name: "doi", label: "DOI", type: "string", optional: true, max: 120 },
      { name: "url", label: "URL", type: "string", optional: true, max: 500 },
      { name: "abstract", label: "Abstract", type: "text", optional: true, max: 4000 },
      NOTES,
      ...PUBLISHING,
    ],
  },
  {
    id: "experience",
    label: "Work history",
    model: "experience",
    slugFrom: "role",
    orderBy: [{ sortIndex: "asc" }, { startDate: "desc" }],
    columns: [
      { field: "role", width: 34, header: "ROLE" },
      { field: "company", width: 26, header: "COMPANY" },
      { field: "dateLabel", width: 18, header: "PERIOD" },
    ],
    fields: [
      { name: "role", label: "Role", type: "string", max: 120 },
      { name: "company", label: "Company", type: "string", max: 120 },
      { name: "location", label: "Location", type: "string", optional: true, max: 120 },
      { name: "employmentType", label: "Employment type", type: "string", optional: true, max: 60 },
      { name: "startDate", label: "Start date", type: "date", hint: "YYYY-MM-DD" },
      { name: "endDate", label: "End date", type: "date", optional: true, hint: "blank means current" },
      { name: "dateLabel", label: "Date label", type: "string", max: 40, hint: "e.g. 2022 - Present" },
      NOTES,
      ...PUBLISHING,
    ],
  },
  {
    id: "education",
    label: "Schools and degrees",
    model: "education",
    slugFrom: "degree",
    orderBy: [{ sortIndex: "asc" }, { startDate: "desc" }],
    columns: [
      { field: "degree", width: 34, header: "DEGREE" },
      { field: "institution", width: 26, header: "INSTITUTION" },
      { field: "dateLabel", width: 18, header: "PERIOD" },
    ],
    fields: [
      { name: "degree", label: "Degree", type: "string", max: 120 },
      { name: "institution", label: "Institution", type: "string", max: 120 },
      { name: "field", label: "Field of study", type: "string", optional: true, max: 120 },
      { name: "startDate", label: "Start date", type: "date", hint: "YYYY-MM-DD" },
      { name: "endDate", label: "End date", type: "date", optional: true, hint: "blank means ongoing" },
      { name: "dateLabel", label: "Date label", type: "string", max: 40 },
      NOTES,
      ...PUBLISHING,
    ],
  },
  {
    id: "career",
    label: "Career.log timeline",
    model: "careerEntry",
    orderBy: [{ year: "desc" }, { sortIndex: "asc" }],
    columns: [
      { field: "year", width: 8, header: "YEAR" },
      { field: "text", width: 62, header: "ENTRY" },
    ],
    fields: [
      { name: "year", label: "Year", type: "int", min: 1970, ceiling: 2100 },
      { name: "text", label: "Entry", type: "text", max: 400 },
      ...PUBLISHING,
    ],
  },
  {
    id: "changelog",
    label: "Changelog.log shipping history",
    model: "changelogEntry",
    orderBy: [{ year: "desc" }, { sortIndex: "asc" }],
    columns: [
      { field: "year", width: 8, header: "YEAR" },
      { field: "text", width: 62, header: "ENTRY" },
    ],
    fields: [
      { name: "year", label: "Year", type: "int", min: 1970, ceiling: 2100 },
      { name: "text", label: "Entry", type: "text", max: 400 },
      ...PUBLISHING,
    ],
  },
  {
    id: "skills",
    label: "Skills.exe levels",
    model: "skill",
    slugFrom: "name",
    orderBy: [{ sortIndex: "asc" }, { level: "desc" }],
    columns: [
      { field: "name", width: 24, header: "NAME" },
      { field: "file", width: 20, header: "FILE" },
      { field: "level", width: 8, header: "LEVEL" },
    ],
    fields: [
      { name: "name", label: "Name", type: "string", max: 60 },
      { name: "file", label: "Filename", type: "string", max: 40, hint: "e.g. tsconfig.sys" },
      { name: "level", label: "Level", type: "int", min: 0, ceiling: 100 },
      { name: "failing", label: "Show as failed install", type: "bool", optional: true, fallback: false },
      { name: "group", label: "Résumé group", type: "string", optional: true, max: 40, hint: "e.g. Frontend — blank renders flat" },
      ...PUBLISHING,
    ],
  },
  {
    id: "projects",
    label: "Project files",
    model: "project",
    slugFrom: "name",
    orderBy: [{ sortIndex: "asc" }, { createdAt: "desc" }],
    columns: [
      { field: "file", width: 20, header: "FILE" },
      { field: "name", width: 24, header: "NAME" },
      { field: "tagline", width: 40, header: "TAGLINE" },
    ],
    fields: [
      { name: "name", label: "Name", type: "string", max: 80 },
      { name: "file", label: "Filename", type: "string", max: 40, hint: "e.g. mykaggo.exe" },
      { name: "version", label: "Version", type: "string", max: 20, fallback: "v1.0" },
      { name: "color", label: "Icon colour", type: "string", max: 9, hint: "hex, e.g. #000080" },
      { name: "type", label: "File type", type: "string", max: 60, fallback: "Win32 application" },
      { name: "size", label: "Size", type: "string", max: 20, hint: "cosmetic, e.g. 4.2 MB" },
      { name: "releaseDate", label: "Release date", type: "string", max: 20, hint: "e.g. 08-31-2026" },
      { name: "tagline", label: "Tagline", type: "string", max: 160 },
      { name: "description", label: "Description", type: "text", max: 4000 },
      NOTES,
      { name: "stack", label: "Stack", type: "list", optional: true, max: 30, hint: "one per line" },
      { name: "demoUrl", label: "Demo URL", type: "string", optional: true, max: 500 },
      { name: "repoUrl", label: "Repository URL", type: "string", optional: true, max: 500 },
      { name: "requirements", label: "Requirements line", type: "string", optional: true, max: 120 },
      ...PUBLISHING,
      ...CASE_STUDY,
    ],
    groups: [
      {
        id: "caseStudy",
        label: "Case study",
        hint: "Optional. Fills the Challenge, Solution, Architecture, Results and Preview tabs; an empty tab says so.",
      },
    ],
  },
  {
    id: "testimonials",
    label: "Testimonial Express inbox",
    model: "testimonial",
    slugFrom: "author",
    orderBy: [{ sortIndex: "asc" }, { createdAt: "desc" }],
    columns: [
      { field: "author", width: 26, header: "FROM" },
      { field: "subject", width: 38, header: "SUBJECT" },
      { field: "stars", width: 7, header: "STARS" },
    ],
    fields: [
      { name: "author", label: "From", type: "string", max: 80 },
      { name: "role", label: "Role line", type: "string", max: 120 },
      { name: "subject", label: "Subject", type: "string", max: 140 },
      { name: "dateLabel", label: "Date label", type: "string", max: 40, hint: "e.g. Today, 10:30 AM" },
      { name: "dateShort", label: "Short date", type: "string", max: 20, hint: "e.g. Today" },
      { name: "stars", label: "Stars", type: "int", min: 1, ceiling: 5 },
      { name: "imageUrl", label: "Image URL", type: "string", max: 500, hint: "https://…" },
      { name: "body", label: "Testimonial", type: "text", max: 2000 },
      ...PUBLISHING,
    ],
  },
  {
    id: "hire",
    label: "Hire_Me.exe submissions",
    model: "inquiry",
    where: { kind: "inquiry" },
    readOnly: true,
    orderBy: [{ createdAt: "desc" }],
    columns: [
      { field: "createdAt", width: 18, header: "RECEIVED" },
      { field: "name", width: 22, header: "NAME" },
      { field: "projectType", width: 26, header: "PROJECT" },
    ],
    fields: [],
  },
  {
    id: "contact",
    label: "Contact.exe messages",
    model: "inquiry",
    where: { kind: "message" },
    readOnly: true,
    orderBy: [{ createdAt: "desc" }],
    columns: [
      { field: "createdAt", width: 18, header: "RECEIVED" },
      { field: "name", width: 22, header: "NAME" },
      { field: "subject", width: 30, header: "SUBJECT" },
    ],
    fields: [],
  },
];

export function findResource(id: string): ResourceSpec | null {
  const wanted = id.trim().toLowerCase();
  return RESOURCES.find((r) => r.id === wanted) ?? null;
}
