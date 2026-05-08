import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";
import { parseJson } from "../../../../server/validators/helpers.js";
import { makeAdminSchema } from "../../../../server/validators/admin.js";

export const POST = withErrors(async (req) => {
  const session = await requireSession("admin");
  requirePermission(session, "roles", "edit");
  const input = await parseJson(req, makeAdminSchema);
  const result = await container.makeAdmin.execute(input);
  return jsonOk(result);
});
