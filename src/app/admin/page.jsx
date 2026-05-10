import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// Bare /admin URL — bounces to the dashboard if a valid admin session
// cookie is present, otherwise to the login page. Avoids the 404 you'd
// otherwise get because the routes are nested under /admin/login and
// /admin/(protected)/dashboard etc., with nothing at the bare segment.

async function readAdminPayload() {
  const store = await cookies();
  const token = store.get("complisk_session")?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );
    return payload?.type === "admin" ? payload : null;
  } catch {
    return null;
  }
}

export default async function AdminIndexPage() {
  // Important: don't wrap redirect() in try/catch — Next throws a sentinel
  // (NEXT_REDIRECT) that the framework expects to bubble. The earlier
  // version caught it and fell through to /admin/login on success.
  const payload = await readAdminPayload();
  redirect(payload ? "/admin/dashboard" : "/admin/login");
}
