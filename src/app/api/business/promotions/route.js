import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";
import { parseJson } from "../../../../server/validators/helpers.js";
import { promotionCreateSchema } from "../../../../server/validators/promotion.js";

export const GET = withErrors(async (req) => {
  const session = await requireSession("business");
  const sp = req.nextUrl.searchParams;
  const result = await container.listBusinessPromotions.execute({
    businessId: session.business.id,
    search: sp.get("search") || "",
    status: sp.get("status") || "",
  });
  return jsonOk(result);
});

export const POST = withErrors(async (req) => {
  const session = await requireSession("business");
  const input = await parseJson(req, promotionCreateSchema);
  const result = await container.createPromotion.execute({
    businessId: session.business.id,
    input,
  });
  return jsonOk(result, { status: 201 });
});
