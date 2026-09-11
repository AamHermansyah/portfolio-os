"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { createRow, deleteRow, getRow, listRows, updateRow, type Row } from "@/lib/admin/crud";
import { findResource } from "@/lib/admin/schema";

/**
 * CRUD over the terminal, as Server Actions.
 *
 * The same two rules as admin-auth.ts apply: every export is an async function,
 * and none of these may touch cookies() or any cache-revalidation helper, or
 * the response would carry an RSC re-render that the non-React caller cannot
 * apply. See components/atoms/admin-bridge.tsx.
 *
 * Authorization is re-checked inside every one of them. A Server Action is
 * reachable by anyone who can send a POST, so the fact that the terminal only
 * offers these commands after a sign-in proves nothing at all.
 */

type Failure = { ok: false; error: string; field?: string };

const DENIED: Failure = { ok: false, error: "unauthorized" };

/** Resolves the caller and the resource together, since every action needs both. */
async function open(token: unknown, resourceId: unknown) {
  const admin = await requireAdmin(token);
  if (!admin) return { ok: false as const, failure: DENIED };

  const spec = typeof resourceId === "string" ? findResource(resourceId) : null;
  if (!spec) return { ok: false as const, failure: { ok: false as const, error: "unknown_resource" } };

  return { ok: true as const, spec };
}

function crashed(action: string, error: unknown): Failure {
  console.error(`[admin] ${action} failed:`, error);
  return { ok: false, error: "server" };
}

/** The field descriptions the terminal uses to build its prompts. */
export async function adminResourceInfo(token: unknown, resourceId: unknown) {
  const found = await open(token, resourceId);
  if (!found.ok) return found.failure;

  const { spec } = found;
  return {
    ok: true as const,
    resource: {
      id: spec.id,
      label: spec.label,
      readOnly: !!spec.readOnly,
      fields: spec.fields,
      columns: spec.columns,
    },
  };
}

export async function adminListRows(token: unknown, resourceId: unknown, page: unknown, pageSize: unknown) {
  const found = await open(token, resourceId);
  if (!found.ok) return found.failure;

  try {
    const result = await listRows(found.spec, Number(page) || 1, Number(pageSize) || 10);
    return {
      ok: true as const,
      ...result,
      columns: found.spec.columns,
      label: found.spec.label,
      readOnly: !!found.spec.readOnly,
    };
  } catch (error) {
    return crashed("list", error);
  }
}

export async function adminGetRow(token: unknown, resourceId: unknown, key: unknown) {
  const found = await open(token, resourceId);
  if (!found.ok) return found.failure;
  if (typeof key !== "string" || !key.trim()) return { ok: false as const, error: "missing_key" };

  try {
    const row = await getRow(found.spec, key.trim());
    if (!row) return { ok: false as const, error: "not_found" };
    return { ok: true as const, row, fields: found.spec.fields, label: found.spec.label };
  } catch (error) {
    return crashed("get", error);
  }
}

export async function adminCreateRow(token: unknown, resourceId: unknown, values: unknown) {
  const found = await open(token, resourceId);
  if (!found.ok) return found.failure;

  try {
    const result = await createRow(found.spec, (values ?? {}) as Row);
    return result.ok ? { ok: true as const, row: result.row } : result;
  } catch (error) {
    return crashed("create", error);
  }
}

export async function adminUpdateRow(token: unknown, resourceId: unknown, key: unknown, values: unknown) {
  const found = await open(token, resourceId);
  if (!found.ok) return found.failure;
  if (typeof key !== "string" || !key.trim()) return { ok: false as const, error: "missing_key" };

  try {
    const result = await updateRow(found.spec, key.trim(), (values ?? {}) as Row);
    return result.ok ? { ok: true as const, row: result.row } : result;
  } catch (error) {
    return crashed("update", error);
  }
}

export async function adminDeleteRow(token: unknown, resourceId: unknown, key: unknown) {
  const found = await open(token, resourceId);
  if (!found.ok) return found.failure;
  if (typeof key !== "string" || !key.trim()) return { ok: false as const, error: "missing_key" };

  try {
    const result = await deleteRow(found.spec, key.trim());
    return result.ok ? { ok: true as const, row: result.row } : result;
  } catch (error) {
    return crashed("delete", error);
  }
}
