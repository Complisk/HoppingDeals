// Uses `jose` instead of `jsonwebtoken` because jose runs in both the Node.js
// runtime (route handlers) and the Edge runtime (middleware.js).

import { SignJWT, jwtVerify } from "jose";

const ALGORITHM = "HS256";

function parseExpiry(input) {
  // Accepts strings like "7d", "12h", "30m", "60s", or a raw number of seconds.
  if (typeof input === "number") return input;
  const m = String(input).trim().match(/^(\d+)([smhd])$/);
  if (!m) return 60 * 60 * 24 * 7;
  const n = Number(m[1]);
  switch (m[2]) {
    case "s": return n;
    case "m": return n * 60;
    case "h": return n * 60 * 60;
    case "d": return n * 60 * 60 * 24;
    default: return 60 * 60 * 24 * 7;
  }
}

/** @implements {import("../../application/ports/token-service.js").TokenService} */
export class JwtTokenService {
  constructor({ secret, expiresIn = "7d" }) {
    if (!secret) throw new Error("JWT secret is required");
    this.key = new TextEncoder().encode(secret);
    this.expiresInSeconds = parseExpiry(expiresIn);
  }

  async sign(payload) {
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: ALGORITHM })
      .setIssuedAt(now)
      .setExpirationTime(now + this.expiresInSeconds)
      .sign(this.key);
  }

  async verify(token) {
    const { payload } = await jwtVerify(token, this.key, { algorithms: [ALGORITHM] });
    return { id: payload.id, type: payload.type };
  }
}
