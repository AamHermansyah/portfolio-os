"use client";

import { useEffect } from "react";

import { adminLogin, adminNeedsSetup, adminReset, adminSetup } from "@/app/actions/admin-auth";
import {
  adminCreateRow,
  adminDeleteRow,
  adminGetRow,
  adminListRows,
  adminResourceInfo,
  adminUpdateRow,
} from "@/app/actions/admin-crud";
import type { AdminAuthResult } from "@/lib/admin/contract";

/**
 * The doorway between PortfolioOS and its Server Actions.
 *
 * The shell is not React. It is one plain-browser IIFE served from
 * /portfolio-runtime.js (see portfolio-runtime.tsx), and a Server Action cannot
 * be reached from there: it is invoked through React's action dispatcher using
 * an encrypted action id and a Flight-encoded POST that no hand-written fetch
 * reproduces, and a classic script cannot import one. So this component imports
 * them the ordinary way and parks thin wrappers on `window`.
 *
 * Publishing them grants nobody a capability they did not already have. A
 * Server Action is a POST endpoint reachable by anyone who can send the
 * request, and its id already ships inside the client bundle — which is exactly
 * why every check lives inside the action rather than around it. What is
 * published here is a narrower door than the one the network already offers.
 *
 * The wrappers never throw, matching the `{ ok, error }` contract the runtime
 * already uses for /api/hire in runtime/portfolio-os/12-inquiry-hire.js.
 *
 * This is deliberately the second "use client" file in the repository rather
 * than an addition to portfolio-runtime.tsx, whose effect opens with an
 * early return once the OS has booted — folding this in would eventually put
 * the assignment behind that guard and silently stop publishing it.
 */

/** CRUD replies vary by command, so the runtime reads them by key. */
type CrudResult = { ok: boolean; error?: string; field?: string; [key: string]: unknown };

type AdminBridge = {
  login: (username: string, password: string) => Promise<AdminAuthResult>;
  setup: (username: string, pin: string, password: string) => Promise<AdminAuthResult>;
  reset: (username: string, pin: string, password: string) => Promise<AdminAuthResult>;
  needsSetup: () => Promise<boolean>;
  crud: {
    info: (token: string, resource: string) => Promise<CrudResult>;
    list: (token: string, resource: string, page: number, pageSize: number) => Promise<CrudResult>;
    get: (token: string, resource: string, key: string) => Promise<CrudResult>;
    create: (token: string, resource: string, values: Record<string, unknown>) => Promise<CrudResult>;
    update: (token: string, resource: string, key: string, values: Record<string, unknown>) => Promise<CrudResult>;
    remove: (token: string, resource: string, key: string) => Promise<CrudResult>;
  };
};

declare global {
  interface Window {
    portfolioOsAdmin?: AdminBridge;
  }
}

/**
 * A deploy rotates action ids, so a tab left open across one can call an action
 * that no longer exists. That is a reload, not a crash, and the terminal says
 * so rather than reporting a mysterious network fault.
 */
function classify(error: unknown): { ok: false; error: string } {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("Server Action")) return { ok: false, error: "stale_build" };
  return { ok: false, error: "network" };
}

/** Same never-throws contract for the CRUD calls, without repeating try/catch six times. */
async function guard(run: () => Promise<CrudResult>): Promise<CrudResult> {
  try {
    return await run();
  } catch (error) {
    return classify(error);
  }
}

export function AdminBridge() {
  useEffect(() => {
    window.portfolioOsAdmin = {
      async login(username, password) {
        try {
          return await adminLogin(username, password);
        } catch (error) {
          return classify(error);
        }
      },
      async setup(username, pin, password) {
        try {
          return await adminSetup(username, pin, password);
        } catch (error) {
          return classify(error);
        }
      },
      async reset(username, pin, password) {
        try {
          return await adminReset(username, pin, password);
        } catch (error) {
          return classify(error);
        }
      },
      async needsSetup() {
        try {
          const result = await adminNeedsSetup();
          return result.ok ? result.needsSetup : false;
        } catch {
          return false;
        }
      },
      crud: {
        info: (token, resource) => guard(() => adminResourceInfo(token, resource)),
        list: (token, resource, page, pageSize) => guard(() => adminListRows(token, resource, page, pageSize)),
        get: (token, resource, key) => guard(() => adminGetRow(token, resource, key)),
        create: (token, resource, values) => guard(() => adminCreateRow(token, resource, values)),
        update: (token, resource, key, values) => guard(() => adminUpdateRow(token, resource, key, values)),
        remove: (token, resource, key) => guard(() => adminDeleteRow(token, resource, key)),
      },
    };

    return () => {
      delete window.portfolioOsAdmin;
    };
  }, []);

  return null;
}
