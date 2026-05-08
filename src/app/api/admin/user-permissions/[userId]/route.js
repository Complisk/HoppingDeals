import { container } from "../../../../../infrastructure/container.js";
import { requireSession } from "../../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../../server/http/handle.js";

export const GET = withErrors(async (_req, ctx) => {
  const session = await requireSession("admin");
  requirePermission(session, "roles", "view");
  const { userId } = await ctx.params;
  const result = await container.getUserPermissions.execute({ userId });
  return jsonOk(result);
});
