import { container } from "../../../../infrastructure/container.js";
import { requireSession } from "../../../../server/http/auth-guard.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";

export const GET = withErrors(async () => {
  const session = await requireSession("user");
  const result = await container.getWishlist.execute({ userId: session.user.id });
  return jsonOk(result);
});

export const POST = withErrors(async (req) => {
  const session = await requireSession("user");
  const { promotionId } = await req.json().catch(() => ({}));
  const result = await container.addToWishlist.execute({
    userId: session.user.id,
    promotionId,
  });
  return jsonOk(result);
});
