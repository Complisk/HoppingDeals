import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";

export const GET = withErrors(async () => {
  const session = await requireSession("business");
  const result = await container.getBusinessDashboard.execute({
    businessId: session.business.id,
  });
  return jsonOk(result);
});
