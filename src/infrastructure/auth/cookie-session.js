// Helpers for the JWT-in-httpOnly-cookie session.
//
// The route handlers use Next's `cookies()` API directly — these helpers just
// centralize the cookie name and attribute defaults so we never accidentally
// drop httpOnly or sameSite somewhere.

export const SESSION_COOKIE = "hopping_deals_session";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function buildSessionCookie(token, maxAgeSeconds) {
  return {
    name: SESSION_COOKIE,
    value: token,
    ...SESSION_COOKIE_OPTIONS,
    maxAge: maxAgeSeconds,
  };
}

export function buildClearedSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: "",
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  };
}
