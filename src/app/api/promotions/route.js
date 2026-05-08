import { container } from "../../../infrastructure/container.js";
import { withErrors, jsonOk } from "../../../server/http/handle.js";

export const GET = withErrors(async (req) => {
  const sp = req.nextUrl.searchParams;
  const result = await container.listPublicPromotions.execute({
    city: sp.get("city") || undefined,
    state: sp.get("state") || undefined,
    timezone: sp.get("timezone") || undefined,
    category: sp.get("category") || undefined,
  });
  return jsonOk(result);
});
