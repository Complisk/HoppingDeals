// Edge middleware. Runs before requests hit route handlers / pages.
// Cheap signature-and-expiry check using `jose` (works in the Edge runtime).
// Full DB hydration happens in route handlers via `requireSession`.

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "hopping_deals_session";

const businessProtected = /^\/business\/(?!login|register|visitor|payment-success)/;
const adminProtected = /^\/admin\/(?!login)/;

async function decode(token, secret) {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const wantsBusiness = businessProtected.test(pathname);
  const wantsAdmin = adminProtected.test(pathname);
  if (!wantsBusiness && !wantsAdmin) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) {
    const url = req.nextUrl.clone();
    url.pathname = wantsAdmin ? "/admin/login" : "/business/login";
    return NextResponse.redirect(url);
  }

  const payload = await decode(token, new TextEncoder().encode(secret));
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = wantsAdmin ? "/admin/login" : "/business/login";
    return NextResponse.redirect(url);
  }

  if (wantsBusiness && payload.type !== "business") {
    const url = req.nextUrl.clone();
    url.pathname = "/business/login";
    return NextResponse.redirect(url);
  }
  if (wantsAdmin && payload.type !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/business/:path*", "/admin/:path*"],
};
