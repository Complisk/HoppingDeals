import { container } from "../../../../../../infrastructure/container.js";
import { requireSession } from "../../../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../../../server/http/handle.js";
import { parseJson } from "../../../../../../server/validators/helpers.js";
import { changePromotionStatusSchema } from "../../../../../../server/validators/admin.js";

export const PUT = withErrors(async (req, ctx) => {
  const session = await requireSession("admin");
  requirePermission(session, "promotions", "approve");

  const { id } = await ctx.params;
  const { status } = await parseJson(req, changePromotionStatusSchema);
  const result = await container.changePromotionStatus.execute({
    promotionId: id,
    status,
  });
  return jsonOk(result);
});
