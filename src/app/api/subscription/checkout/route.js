import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";
import { parseJson } from "../../../../server/validators/helpers.js";
import { createSubscriptionCheckoutSchema } from "../../../../server/validators/subscription.js";

// Build the absolute origin Stripe will redirect back to. Prefers the
// request's own URL so localhost dev "just works" without setting env.
function originFromRequest(req) {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    req.nextUrl.origin ||
    `${req.headers.get("x-forwarded-proto") ?? "https"}://${req.headers.get("host") ?? "localhost:3000"}`
  );
}

export const POST = withErrors(async (req) => {
  const session = await requireSession("business");
  const { templateId } = await parseJson(req, createSubscriptionCheckoutSchema);
  const result = await container.createSubscriptionCheckout.execute({
    businessId: session.business.id,
    templateId,
    frontendUrl: originFromRequest(req),
  });
  return jsonOk(result);
});
