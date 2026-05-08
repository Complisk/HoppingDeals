import { container } from "../../../infrastructure/container.js";
import { requireSession } from "../../../server/http/auth-guard.js";
import { requirePermission } from "../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../server/http/handle.js";
import { parseJson } from "../../../server/validators/helpers.js";
import { roleCreateSchema } from "../../../server/validators/role.js";

export const GET = withErrors(async () => {
  const session = await requireSession("admin");
  requirePermission(session, "roles", "view");
  const roles = await container.listRoles.execute();
  return jsonOk(roles);
});

export const POST = withErrors(async (req) => {
  const session = await requireSession("admin");
  requirePermission(session, "roles", "create");
  const input = await parseJson(req, roleCreateSchema);
  const role = await container.createRole.execute(input);
  return jsonOk(role, { status: 201 });
});
