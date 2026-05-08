import { container } from "../../../../../../infrastructure/container.js";
import { requireSession } from "../../../../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../../../../server/http/handle.js";

export const POST = withErrors(async (_req, ctx) => {
  const session = await requireSession("business");
  const { promotionId } = await ctx.params;
  const result = await container.deactivatePromotion.execute({
    businessId: session.business.id,
    promotionId,
  });
  return jsonOk(result);
});
