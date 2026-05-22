import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// Bare /business URL — bounces to the dashboard if a valid business
// session cookie is present, otherwise to the login page. Same pattern
// as /admin/page.jsx.

async function readBusinessPayload() {
  const store = await cookies();
  const token = store.get("hopping_deals_session")?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );
    return payload?.type === "business" ? payload : null;
  } catch {
    return null;
  }
}

export default async function BusinessIndexPage() {
  // Don't wrap redirect() in try/catch — Next throws NEXT_REDIRECT and we
  // want it to bubble.
  const payload = await readBusinessPayload();
  redirect(payload ? "/business/dashboard" : "/business/login");
}
