import { container } from "../../../infrastructure/container.js";
import { withErrors, jsonOk } from "../../../server/http/handle.js";

function clientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "8.8.8.8";
}

export const GET = withErrors(async (req) => {
  const sp = req.nextUrl.searchParams;
  const ip = clientIp(req);

  const result = await container.lookupLocation.execute({
    ip,
    city: sp.get("city") || undefined,
    state: sp.get("state") || undefined,
    lat: sp.get("lat") || undefined,
    lon: sp.get("lon") || undefined,
  });
  return jsonOk(result);
});
