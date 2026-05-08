import { container } from "../../../../../infrastructure/container.js";
import { requireSession } from "../../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../../server/http/handle.js";

export const DELETE = withErrors(async (_req, ctx) => {
  const session = await requireSession("admin");
  requirePermission(session, "templates", "delete");
  const { id } = await ctx.params;
  const result = await container.deleteTemplate.execute({ templateId: id });
  return jsonOk(result);
});
