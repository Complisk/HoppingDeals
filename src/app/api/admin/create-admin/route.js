import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";
import { parseJson } from "../../../../server/validators/helpers.js";
import { createAdminUserSchema } from "../../../../server/validators/admin.js";

export const POST = withErrors(async (req) => {
  const session = await requireSession("admin");
  requirePermission(session, "roles", "create");
  const input = await parseJson(req, createAdminUserSchema);
  const result = await container.createAdminUser.execute(input);
  return jsonOk(result, { status: 201 });
});
