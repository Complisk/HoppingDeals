import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";

export const GET = withErrors(async (req) => {
  const session = await requireSession("admin");
  requirePermission(session, "promotions", "view");

  const sp = req.nextUrl.searchParams;
  const result = await container.listAdminPromotions.execute({
    status: sp.get("status") || undefined,
    search: sp.get("search") || undefined,
    page: sp.get("page") || 1,
    limit: sp.get("limit") || 10,
  });
  return jsonOk(result);
});
