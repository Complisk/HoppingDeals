import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";

export const GET = withErrors(async () => {
  const session = await requireSession("user");
  const result = await container.getUserProfile.execute({
    userId: session.user.id,
  });
  return jsonOk(result);
});

export const PUT = withErrors(async (req) => {
  const session = await requireSession("user");
  const patch = await req.json().catch(() => ({}));
  const result = await container.updateUserProfile.execute({
    userId: session.user.id,
    patch,
  });
  return jsonOk(result);
});
