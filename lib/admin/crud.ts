import "server-only";

import type { FieldSpec, ResourceSpec } from "@/lib/admin/schema";
import { prisma } from "@/lib/prisma";

/**
 * Generic create/read/update/delete driven by the field descriptions in
 * schema.ts. Every resource shares this one validated path, so a length cap or
 * a type check can only be forgotten once, in one place, rather than eleven
 * times over.
 */

/** The slice of a Prisma delegate this layer uses, so the model can be picked by name. */
type Delegate = {
  findMany: (args: unknown) => Promise<Record<string, unknown>[]>;
  findFirst: (args: unknown) => Promise<Record<string, unknown> | null>;
  count: (args?: unknown) => Promise<number>;
  create: (args: unknown) => Promise<Record<string, unknown>>;
  update: (args: unknown) => Promise<Record<string, unknown>>;
  delete: (args: unknown) => Promise<Record<string, unknown>>;
};

function delegate(spec: ResourceSpec): Delegate {
  const client = prisma as unknown as Record<string, Delegate>;
  const found = client[spec.model];
  if (!found) throw new Error(`Unknown Prisma model: ${spec.model}`);
  return found;
}

export type Row = Record<string, unknown>;

export type Invalid = { ok: false; error: string; field?: string };
export type Valid = { ok: true; data: Row };

const MAX_PAGE_SIZE = 50;

/** Dates do not survive a trip through plain browser JS intact; strings do. */
function serialize(row: Row | null): Row | null {
  if (!row) return null;
  const out: Row = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value instanceof Date ? value.toISOString() : value;
  }
  return out;
}

function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "entry";
}

/** Appends -2, -3 … until the slug is free. Bounded so a pathological case ends. */
async function uniqueSlug(spec: ResourceSpec, base: string, exceptId?: string): Promise<string> {
  const model = delegate(spec);
  for (let suffix = 1; suffix <= 200; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const clash = await model.findFirst({ where: { slug: candidate }, select: { id: true } });
    if (!clash || clash.id === exceptId) return candidate;
  }
  return `${base}-${Date.now()}`;
}

function invalid(field: FieldSpec, reason: string): Invalid {
  return { ok: false, error: reason, field: field.name };
}

/** Turns one raw terminal answer into a column value, or explains why it cannot. */
function coerceField(field: FieldSpec, raw: unknown): { ok: true; value: unknown } | Invalid {
  const isList = field.type === "list";
  const empty = isList
    ? !Array.isArray(raw) || raw.length === 0
    : raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "");

  if (empty) {
    if (field.optional) {
      if (field.fallback !== undefined) return { ok: true, value: field.fallback };
      return { ok: true, value: isList ? [] : null };
    }
    if (field.fallback !== undefined) return { ok: true, value: field.fallback };
    return invalid(field, `${field.label} is required.`);
  }

  switch (field.type) {
    case "string":
    case "text": {
      const text = String(raw).trim();
      if (field.max && text.length > field.max) return invalid(field, `${field.label} is longer than ${field.max} characters.`);
      return { ok: true, value: text };
    }
    case "int": {
      const number = Number(String(raw).trim());
      if (!Number.isInteger(number)) return invalid(field, `${field.label} must be a whole number.`);
      if (field.min !== undefined && number < field.min) return invalid(field, `${field.label} must be at least ${field.min}.`);
      if (field.ceiling !== undefined && number > field.ceiling) return invalid(field, `${field.label} must be at most ${field.ceiling}.`);
      return { ok: true, value: number };
    }
    case "bool": {
      const text = String(raw).trim().toLowerCase();
      if (["y", "yes", "true", "1", "on"].includes(text)) return { ok: true, value: true };
      if (["n", "no", "false", "0", "off"].includes(text)) return { ok: true, value: false };
      return invalid(field, `${field.label} must be yes or no.`);
    }
    case "enum": {
      const text = String(raw).trim().toLowerCase();
      if (!field.options?.includes(text)) return invalid(field, `${field.label} must be one of: ${field.options?.join(", ")}.`);
      return { ok: true, value: text };
    }
    case "date": {
      const text = String(raw).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return invalid(field, `${field.label} must look like YYYY-MM-DD.`);
      const parsed = new Date(`${text}T00:00:00.000Z`);
      if (Number.isNaN(parsed.getTime())) return invalid(field, `${field.label} is not a real date.`);
      return { ok: true, value: parsed };
    }
    case "list": {
      const items = (raw as unknown[]).map((item) => String(item).trim()).filter((item) => item.length > 0);
      if (field.max && items.length > field.max) return invalid(field, `${field.label} allows at most ${field.max} entries.`);
      if (items.some((item) => item.length > 500)) return invalid(field, `Each ${field.label.toLowerCase()} entry must be under 500 characters.`);
      return { ok: true, value: items };
    }
    default:
      return invalid(field, `${field.label} has an unsupported type.`);
  }
}

/**
 * `partial` is what separates an edit from a create: on edit, a field the user
 * skipped keeps its stored value instead of being reset to a default.
 */
export function coerce(spec: ResourceSpec, values: Row, partial: boolean): Valid | Invalid {
  const data: Row = {};
  for (const field of spec.fields) {
    const supplied = Object.prototype.hasOwnProperty.call(values, field.name);
    if (partial && !supplied) continue;
    const result = coerceField(field, values[field.name]);
    if (!result.ok) return result;
    data[field.name] = result.value;
  }
  return { ok: true, data };
}

export async function listRows(spec: ResourceSpec, page: number, pageSize: number) {
  const model = delegate(spec);
  const size = Math.min(Math.max(1, Math.trunc(pageSize) || 10), MAX_PAGE_SIZE);
  const total = await model.count({ where: spec.where ?? {} });
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), pages);
  const rows = await model.findMany({
    where: spec.where ?? {},
    orderBy: spec.orderBy,
    skip: (current - 1) * size,
    take: size,
  });
  return { rows: rows.map((row) => serialize(row) as Row), total, page: current, pages, pageSize: size };
}

/**
 * Looks up by id, and by slug too when the resource has one — typing a slug is
 * far kinder at a terminal than copying a cuid.
 */
export async function getRow(spec: ResourceSpec, key: string): Promise<Row | null> {
  const model = delegate(spec);
  const where = spec.slugFrom
    ? { AND: [spec.where ?? {}, { OR: [{ id: key }, { slug: key }] }] }
    : { AND: [spec.where ?? {}, { id: key }] };
  const row = await model.findFirst({ where });
  if (!row) return null;

  // Opening a submission is what marks it read; there is no separate command.
  if (spec.readOnly && row.readAt === null) {
    const updated = await model.update({ where: { id: row.id as string }, data: { readAt: new Date() } });
    return serialize(updated);
  }
  return serialize(row);
}

export async function createRow(spec: ResourceSpec, values: Row): Promise<{ ok: true; row: Row } | Invalid> {
  if (spec.readOnly) return { ok: false, error: `${spec.label} cannot be created here.` };
  const coerced = coerce(spec, values, false);
  if (!coerced.ok) return coerced;

  const data = coerced.data;
  if (spec.slugFrom) {
    const source = String(data[spec.slugFrom] ?? "");
    data.slug = await uniqueSlug(spec, slugify(source));
  }
  const row = await delegate(spec).create({ data });
  return { ok: true, row: serialize(row) as Row };
}

export async function updateRow(spec: ResourceSpec, key: string, values: Row): Promise<{ ok: true; row: Row } | Invalid> {
  if (spec.readOnly) return { ok: false, error: `${spec.label} cannot be edited here.` };
  const existing = await getRow(spec, key);
  if (!existing) return { ok: false, error: "No entry with that id or slug." };

  const coerced = coerce(spec, values, true);
  if (!coerced.ok) return coerced;

  const data = coerced.data;
  if (spec.slugFrom && data[spec.slugFrom] !== undefined) {
    const source = String(data[spec.slugFrom] ?? "");
    data.slug = await uniqueSlug(spec, slugify(source), existing.id as string);
  }
  const row = await delegate(spec).update({ where: { id: existing.id as string }, data });
  return { ok: true, row: serialize(row) as Row };
}

export async function deleteRow(spec: ResourceSpec, key: string): Promise<{ ok: true; row: Row } | Invalid> {
  const existing = await getRow(spec, key);
  if (!existing) return { ok: false, error: "No entry with that id or slug." };
  await delegate(spec).delete({ where: { id: existing.id as string } });
  return { ok: true, row: existing };
}
