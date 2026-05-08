import { container } from "../../../infrastructure/container.js";
import { requireSession } from "../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../server/http/handle.js";
import { parseJson } from "../../../server/validators/helpers.js";
import { createSubscriptionTemplateSchema } from "../../../server/validators/subscription.js";

export const GET = withErrors(async () => {
  const result = await container.listSubscriptionTemplates.execute();
  return jsonOk(result);
});

export const POST = withErrors(async (req) => {
  await requireSession("admin");
  const input = await parseJson(req, createSubscriptionTemplateSchema);
  const result = await container.createSubscriptionTemplate.execute(input);
  return jsonOk(result, { status: 201 });
});
