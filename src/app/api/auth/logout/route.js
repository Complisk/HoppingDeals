import { NextResponse } from "next/server";
import { buildClearedSessionCookie } from "../../../../infrastructure/auth/cookie-session.js";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set(buildClearedSessionCookie());
  return res;
}
