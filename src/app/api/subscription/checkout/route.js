import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";
import { parseJson } from "../../../../server/validators/helpers.js";
import { createSubscriptionCheckoutSchema } from "../../../../server/validators/subscription.js";

export const POST = withErrors(async (req) => {
  const session = await requireSession("business");
  const { templateId } = await parseJson(req, createSubscriptionCheckoutSchema);
  const result = await container.createSubscriptionCheckout.execute({
    businessId: session.business.id,
    templateId,
  });
  return jsonOk(result);
});
