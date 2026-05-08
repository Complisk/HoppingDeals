import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";

export const GET = withErrors(async (req) => {
  const session = await requireSession("admin");
  requirePermission(session, "users", "view");

  const sp = req.nextUrl.searchParams;
  const result = await container.listAdminUsers.execute({
    search: sp.get("search") || undefined,
    role: sp.get("role") || undefined,
    status: sp.get("status") || undefined,
    page: sp.get("page") || 1,
    limit: sp.get("limit") || 10,
  });
  return jsonOk(result);
});
