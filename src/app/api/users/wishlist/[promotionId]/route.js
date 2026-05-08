import { container } from "../../../../../infrastructure/container.js";
import { requireSession } from "../../../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../../../server/http/handle.js";

export const DELETE = withErrors(async (_req, ctx) => {
  const session = await requireSession("user");
  const { promotionId } = await ctx.params;
  const result = await container.removeFromWishlist.execute({
    userId: session.user.id,
    promotionId,
  });
  return jsonOk(result);
});
