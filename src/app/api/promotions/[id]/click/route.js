import { container } from "../../../../../infrastructure/container.js";
import { withErrors, jsonOk } from "../../../../../server/http/handle.js";

export const POST = withErrors(async (_req, ctx) => {
  const { id } = await ctx.params;
  const result = await container.incrementPromotionClick.execute({ id });
  return jsonOk(result);
});
