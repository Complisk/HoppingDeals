import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";

export const GET = withErrors(async (req) => {
  const session = await requireSession("business");
  const sp = req.nextUrl.searchParams;
  const result = await container.getSubscriptionHistory.execute({
    businessId: session.business.id,
    page: sp.get("page") || 1,
    limit: sp.get("limit") || 10,
  });
  return jsonOk(result);
});
