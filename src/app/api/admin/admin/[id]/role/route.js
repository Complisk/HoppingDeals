import { container } from "../../../../../../infrastructure/container.js";
import { requireSession } from "../../../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../../../server/http/handle.js";
import { parseJson } from "../../../../../../server/validators/helpers.js";
import { updateAdminRoleSchema } from "../../../../../../server/validators/admin.js";

export const PUT = withErrors(async (req, ctx) => {
  const session = await requireSession("admin");
  requirePermission(session, "roles", "edit");

  const { id } = await ctx.params;
  const input = await parseJson(req, updateAdminRoleSchema);
  const result = await container.updateAdminRole.execute({ userId: id, ...input });
  return jsonOk(result);
});
