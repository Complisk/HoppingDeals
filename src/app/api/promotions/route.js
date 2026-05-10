import { container } from "../../../infrastructure/container.js";
import { withErrors, jsonOk } from "../../../server/http/handle.js";

export const GET = withErrors(async (req) => {
  const sp = req.nextUrl.searchParams;
  // CategoryStreet on the homepage links to multi-category URLs like
  // /category/restaurants,food — accept either a comma-joined string or
  // a single slug here and hand a clean array to the use case.
  const rawCategory = sp.get("category");
  const categoryList = rawCategory
    ? rawCategory
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const result = await container.listPublicPromotions.execute({
    city: sp.get("city") || undefined,
    state: sp.get("state") || undefined,
    timezone: sp.get("timezone") || undefined,
    category: categoryList.length === 1 ? categoryList[0] : undefined,
    categories: categoryList.length > 1 ? categoryList : undefined,
  });
  return jsonOk(result);
});
