import { ForbiddenError } from "../../core/errors/index.js";

/**
 * Throws ForbiddenError unless the authenticated admin user has the given
 * (module, action) permission. SuperAdmin bypasses the check.
 */
export function requirePermission(session, module, action) {
  if (session.kind !== "admin") {
    throw new ForbiddenError("Admin access required");
  }
  const user = session.user;
  if (user.isSuperAdmin) return;

  if (!user.hasPermission(module, action)) {
    throw new ForbiddenError(`Access denied: ${module} ${action}`);
  }
}
