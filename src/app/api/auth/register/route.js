import { container, tokenExpirySeconds } from "../../../../infrastructure/container.js";
import { withErrors } from "../../../../server/http/handle.js";
import { parseJson } from "../../../../server/validators/helpers.js";
import { userRegistrationSchema } from "../../../../server/validators/auth.js";
import { buildSessionCookie } from "../../../../infrastructure/auth/cookie-session.js";
import { NextResponse } from "next/server";

export const POST = withErrors(async (req) => {
  const input = await parseJson(req, userRegistrationSchema);
  const result = await container.registerUser.execute(input);

  const res = NextResponse.json(result, { status: 201 });
  res.cookies.set(buildSessionCookie(result.token, tokenExpirySeconds()));
  return res;
});
