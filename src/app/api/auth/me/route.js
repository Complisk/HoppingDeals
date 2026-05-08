// Used by the client to recover the current session after page refresh.
import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";

export const GET = withErrors(async () => {
  const session = await requireSession();
  if (session.kind === "business") {
    return jsonOk({ kind: "business", business: session.business.toPublicJSON() });
  }

  // For users/admins, return profile + (for admins) permissions.
  if (session.kind === "admin") {
    const result = await container.getUserPermissions.execute({
      userId: session.user.id,
    });
    return jsonOk({
      kind: "admin",
      user: session.user.toPublicJSON(),
      ...result,
    });
  }
  return jsonOk({ kind: "user", user: session.user.toPublicJSON() });
});
