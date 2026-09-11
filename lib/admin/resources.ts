import type { AdminResource } from "@/lib/admin/contract";
import { RESOURCES } from "@/lib/admin/schema";

/**
 * What the terminal offers to manage once you are signed in.
 *
 * Derived from the CRUD registry rather than written out again, so the welcome
 * screen cannot advertise a resource the backend does not implement, or omit
 * one it does. A read-only resource is labelled as such, because "manage" would
 * overstate what the submission inboxes allow.
 */
export const ADMIN_RESOURCES: AdminResource[] = RESOURCES.map((resource) => ({
  id: resource.id,
  status: "ready",
  label: resource.readOnly ? `${resource.label} (read only)` : resource.label,
}));
