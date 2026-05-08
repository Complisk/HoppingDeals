/**
 * Abstracts Stripe so business logic doesn't depend on the SDK.
 *
 * @typedef {object} PaymentGateway
 * @property {(input: { email: string, name: string, metadata?: Record<string,string> }) => Promise<{ id: string }>} createCustomer
 * @property {(input: { amountCents: number, customerId: string, metadata?: Record<string,string>, description?: string }) => Promise<{ id: string, clientSecret: string }>} createPaymentIntent
 * @property {(input: { customerId: string, lineItem: { name: string, unitAmountCents: number, quantity: number, recurringInterval?: "month" | "year" }, mode: "payment" | "subscription", successUrl: string, cancelUrl: string, metadata?: Record<string,string> }) => Promise<{ id: string, url: string }>} createCheckoutSession
 * @property {(subscriptionId: string) => Promise<{ id: string }>} retrieveSubscription
 * @property {(rawBody: string | Buffer, signature: string) => Promise<object>} verifyWebhook
 */

export {};
