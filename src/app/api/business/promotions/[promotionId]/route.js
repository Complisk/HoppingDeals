// Business endpoints for a single promotion. The route segment param name
// matches what the old API used so the frontend services can stay stable.
import { container } from "../../../../../infrastructure/container.js";
import { requireSession } from "../../../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../../../server/http/handle.js";
import { parseJson } from "../../../../../server/validators/helpers.js";
import { promotionUpdateSchema } from "../../../../../server/validators/promotion.js";

export const GET = withErrors(async (_req, ctx) => {
  const session = await requireSession("business");
  const { promotionId } = await ctx.params;
  const result = await container.getBusinessPromotion.execute({
    businessId: session.business.id,
    promotionId,
  });
  return jsonOk(result);
});

export const PUT = withErrors(async (req, ctx) => {
  const session = await requireSession("business");
  const { promotionId } = await ctx.params;
  const patch = await parseJson(req, promotionUpdateSchema);
  const result = await container.updatePromotion.execute({
    businessId: session.business.id,
    promotionId,
    patch,
  });
  return jsonOk({ message: "Promotion updated successfully", promotion: result });
});

export const DELETE = withErrors(async (_req, ctx) => {
  const session = await requireSession("business");
  const { promotionId } = await ctx.params;
  const result = await container.deletePromotion.execute({
    businessId: session.business.id,
    promotionId,
  });
  return jsonOk(result);
});
