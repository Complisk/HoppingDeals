// Stripe webhook. We must read the raw body string for signature verification —
// `req.text()` gives us the unmodified payload exactly as Stripe sent it.
//
// Note: a `route.js` segment-level config can opt into the Node.js runtime if
// the build ever picks Edge by default. Stripe SDK is Node-only.
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { container } from "../../../../infrastructure/container.js";

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = await container.paymentGateway.verifyWebhook(rawBody, sig);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    const result = await container.handleStripeWebhook.execute({ event });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[stripe webhook] handler failed:", err);
    // Return 200 anyway so Stripe doesn't infinitely retry on internal bugs;
    // the alternative (500) would mask the issue. Tune later if needed.
    return NextResponse.json({ received: true });
  }
}
