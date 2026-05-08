// Reads the JWT cookie, hydrates the principal via VerifyTokenUseCase, and
// enforces an optional role. Replaces the `protect(role)` middleware in the
// old Express backend.

import { cookies } from "next/headers";
import { container } from "../../infrastructure/container.js";
import { SESSION_COOKIE } from "../../infrastructure/auth/cookie-session.js";
import { UnauthorizedError } from "../../core/errors/index.js";

/** @param {"user" | "business" | "admin"} [requiredRole] */
export async function requireSession(requiredRole) {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) throw new UnauthorizedError("No token provided");

  return container.verifyToken.execute({ token, requiredRole });
}
