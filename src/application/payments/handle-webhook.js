// Process Stripe webhook events.
// - checkout.session.completed (mode=subscription) -> activate BusinessSubscription
// - payment_intent.succeeded                       -> mark Promotion paid
//
// Webhook signature verification is done in the route handler before this
// runs, so the event passed in is trusted.
export class HandleStripeWebhookUseCase {
  /**
   * @param {{ businessRepo,
   *          subscriptionRepo,
   *          subscriptionTemplateRepo,
   *          promotionRepo,
   *          payments }} deps
   */
  constructor({
    businessRepo,
    subscriptionRepo,
    subscriptionTemplateRepo,
    promotionRepo,
    payments,
  }) {
    this.businessRepo = businessRepo;
    this.subscriptionRepo = subscriptionRepo;
    this.subscriptionTemplateRepo = subscriptionTemplateRepo;
    this.promotionRepo = promotionRepo;
    this.payments = payments;
  }

  async execute({ event }) {
    if (event.type === "checkout.session.completed") {
      await this.#onCheckoutCompleted(event.data.object);
    } else if (event.type === "payment_intent.succeeded") {
      await this.#onPaymentIntentSucceeded(event.data.object);
    }
    return { received: true };
  }

  async #onCheckoutCompleted(session) {
    if (session.mode !== "subscription") return;

    const stripeSubscription = await this.payments.retrieveSubscription(
      session.subscription
    );
    const { businessId, templateId } = session.metadata || {};
    const business = await this.businessRepo.findById(businessId);
    const template = await this.subscriptionTemplateRepo.findById(templateId);
    if (!business || !template) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + template.durationMonths);

    await this.subscriptionRepo.expireAllActiveForBusiness(business.id);
    await this.subscriptionRepo.create({
      businessId: business.id,
      subscriptionTemplateId: template.id,
      startDate,
      endDate,
      freeCities: template.freeCities,
      freeStates: template.freeStates,
      freeTimezones: template.freeTimezones,
      stripeSubscriptionId: stripeSubscription.id,
      status: "active",
    });
  }

  async #onPaymentIntentSucceeded(paymentIntent) {
    const { promotionId, businessId } = paymentIntent.metadata || {};
    if (!promotionId) return;

    const promotion = await this.promotionRepo.findById(promotionId);
    const business = businessId ? await this.businessRepo.findById(businessId) : null;
    if (!promotion) return;

    promotion.registerPaymentSucceeded({
      stripePaymentId: paymentIntent.id,
      businessAutoApproves: !!business?.autoApprovePromotions,
    });
    await this.promotionRepo.save(promotion);
  }
}
