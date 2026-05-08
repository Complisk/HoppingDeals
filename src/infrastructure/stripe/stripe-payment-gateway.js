import Stripe from "stripe";

/** @implements {import("../../application/ports/payment-gateway.js").PaymentGateway} */
export class StripePaymentGateway {
  constructor({ secretKey, webhookSecret }) {
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    this.stripe = new Stripe(secretKey);
    this.webhookSecret = webhookSecret;
  }

  async createCustomer({ email, name, metadata = {} }) {
    const customer = await this.stripe.customers.create({ email, name, metadata });
    return { id: customer.id };
  }

  async createPaymentIntent({ amountCents, customerId, metadata = {}, description }) {
    const intent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: customerId,
      payment_method_types: ["card"],
      metadata,
      description,
    });
    return { id: intent.id, clientSecret: intent.client_secret };
  }

  async createCheckoutSession({
    customerId,
    lineItem,
    mode,
    successUrl,
    cancelUrl,
    metadata = {},
  }) {
    const priceData = {
      currency: "usd",
      product_data: { name: lineItem.name },
      unit_amount: lineItem.unitAmountCents,
    };
    if (lineItem.recurringInterval) {
      priceData.recurring = { interval: lineItem.recurringInterval };
    }

    const session = await this.stripe.checkout.sessions.create({
      mode,
      customer: customerId,
      line_items: [{ price_data: priceData, quantity: lineItem.quantity }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    return { id: session.id, url: session.url };
  }

  async retrieveSubscription(subscriptionId) {
    const sub = await this.stripe.subscriptions.retrieve(subscriptionId);
    return { id: sub.id };
  }

  async verifyWebhook(rawBody, signature) {
    if (!this.webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }
    return this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
  }
}
