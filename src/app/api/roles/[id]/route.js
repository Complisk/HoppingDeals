import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";
import { parseJson } from "../../../../server/validators/helpers.js";
import { roleUpdateSchema } from "../../../../server/validators/role.js";

export const PUT = withErrors(async (req, ctx) => {
  const session = await requireSession("admin");
  requirePermission(session, "roles", "edit");
  const { id } = await ctx.params;
  const input = await parseJson(req, roleUpdateSchema);
  const result = await container.updateRole.execute({ id, ...input });
  return jsonOk(result);
});

export const DELETE = withErrors(async (_req, ctx) => {
  const session = await requireSession("admin");
  requirePermission(session, "roles", "delete");
  const { id } = await ctx.params;
  const result = await container.deleteRole.execute({ id });
  return jsonOk(result);
});
