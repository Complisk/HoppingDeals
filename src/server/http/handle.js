// Translates use-case calls into HTTP responses. Maps domain errors to status
// codes so route handlers stay tiny.

import { NextResponse } from "next/server";
import {
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from "../../core/errors/index.js";

const STATUS = new Map([
  [ValidationError, 400],
  [UnauthorizedError, 401],
  [ForbiddenError, 403],
  [NotFoundError, 404],
  [ConflictError, 409],
]);

export function jsonOk(data, init = {}) {
  return NextResponse.json(data, init);
}

export function jsonError(status, message, extra = {}) {
  return NextResponse.json({ message, ...extra }, { status });
}

export function mapErrorToResponse(err) {
  for (const [Type, status] of STATUS) {
    if (err instanceof Type) {
      const body = { message: err.message };
      if (err.details) body.details = err.details;
      return NextResponse.json(body, { status });
    }
  }
  if (err instanceof DomainError) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
  // Unknown / unexpected — log server-side, return generic.
  console.error("[unhandled]", err);
  return NextResponse.json(
    { message: err?.message || "Server error" },
    { status: 500 }
  );
}

// Wraps an async route-handler body in the shared error handler.
//   export const POST = withErrors(async (req) => { ... });
export function withErrors(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      return mapErrorToResponse(err);
    }
  };
}
