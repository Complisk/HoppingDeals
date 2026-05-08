import { container } from "../../../../infrastructure/container.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";
import { parseJson } from "../../../../server/validators/helpers.js";
import { promotionPriceSchema } from "../../../../server/validators/promotion.js";

export const POST = withErrors(async (req) => {
  const input = await parseJson(req, promotionPriceSchema);
  const result = await container.calculatePromotionPrice.execute(input);
  return jsonOk(result);
});
