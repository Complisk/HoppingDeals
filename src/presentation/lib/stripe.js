import { loadStripe } from "@stripe/stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

// loadStripe accepts an empty string and returns null at build time so SSR
// doesn't crash; we only need the real client at interaction time.
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
