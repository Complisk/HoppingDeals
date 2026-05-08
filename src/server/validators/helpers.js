import { ValidationError } from "../../core/errors/index.js";

// Parse a Zod schema and translate failure into our domain ValidationError so
// the error mapper returns 400 with a structured payload.
export async function parseJson(req, schema) {
  let body;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.flatten());
  }
  return result.data;
}

export function parseQuery(searchParams, schema) {
  const obj = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(obj);
  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.flatten());
  }
  return result.data;
}
