import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";

export const GET = withErrors(async () => {
  const session = await requireSession("admin");
  requirePermission(session, "dashboard", "view");
  const result = await container.getAdminDashboard.execute();
  return jsonOk(result);
});
