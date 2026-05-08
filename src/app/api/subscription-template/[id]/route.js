import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";

export const DELETE = withErrors(async (_req, ctx) => {
  await requireSession("admin");
  const { id } = await ctx.params;
  const result = await container.deactivateSubscriptionTemplate.execute({ id });
  return jsonOk(result);
});
