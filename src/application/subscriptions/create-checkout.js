import { NotFoundError } from "../../core/errors/index.js";

export class CreateSubscriptionCheckoutUseCase {
  constructor({ businessRepo, subscriptionTemplateRepo, payments, env }) {
    this.businessRepo = businessRepo;
    this.subscriptionTemplateRepo = subscriptionTemplateRepo;
    this.payments = payments;
    this.env = env;
  }

  async execute({ businessId, templateId }) {
    const business = await this.businessRepo.findById(businessId);
    if (!business) throw new NotFoundError("Business");

    const template = await this.subscriptionTemplateRepo.findById(templateId);
    if (!template || !template.isActive) {
      throw new NotFoundError("Subscription plan");
    }

    let customerId = business.stripeCustomerId;
    if (!customerId) {
      const customer = await this.payments.createCustomer({
        email: business.email,
        name: business.name,
      });
      customerId = customer.id;
      await this.businessRepo.update(business.id, { stripeCustomerId: customerId });
    }

    const session = await this.payments.createCheckoutSession({
      mode: "subscription",
      customerId,
      lineItem: {
        name: template.name,
        unitAmountCents: Math.round(Number(template.price) * 100),
        quantity: template.durationMonths,
        recurringInterval: "month",
      },
      successUrl: `${this.env.frontendUrl}/subscription-success`,
      cancelUrl: `${this.env.frontendUrl}/subscription-cancel`,
      metadata: {
        businessId: business.id,
        templateId: template.id,
      },
    });

    return { url: session.url };
  }
}
