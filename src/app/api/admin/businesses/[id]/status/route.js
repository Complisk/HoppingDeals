import { container } from "../../../../../../infrastructure/container.js";
import { requireSession } from "../../../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../../../server/http/handle.js";
import { parseJson } from "../../../../../../server/validators/helpers.js";
import { updateBusinessStatusSchema } from "../../../../../../server/validators/admin.js";

export const PUT = withErrors(async (req, ctx) => {
  const session = await requireSession("admin");
  requirePermission(session, "businesses", "edit");

  const { id } = await ctx.params;
  const { status } = await parseJson(req, updateBusinessStatusSchema);
  const result = await container.updateBusinessStatus.execute({
    businessId: id,
    status,
  });
  return jsonOk(result);
});
