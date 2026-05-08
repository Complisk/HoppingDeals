import { container } from "../../../../../../infrastructure/container.js";
import { requireSession } from "../../../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../../../server/http/handle.js";
import { parseJson } from "../../../../../../server/validators/helpers.js";
import { toggleAutoApproveSchema } from "../../../../../../server/validators/admin.js";

export const PUT = withErrors(async (req, ctx) => {
  const session = await requireSession("admin");
  requirePermission(session, "businesses", "auto_approve");

  const { id } = await ctx.params;
  const { autoApprovePromotions } = await parseJson(req, toggleAutoApproveSchema);
  const result = await container.toggleBusinessAutoApprove.execute({
    businessId: id,
    autoApprovePromotions,
  });
  return jsonOk(result);
});
