import { container } from "../../../../infrastructure/container.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";

export const GET = withErrors(async (_req, ctx) => {
  const { id } = await ctx.params;
  const result = await container.getPromotionById.execute({
    id,
    incrementView: true,
  });
  return jsonOk(result);
});
