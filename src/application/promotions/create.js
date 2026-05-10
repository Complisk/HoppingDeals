import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../core/errors/index.js";
import { calculateAddOnPrice } from "../../shared/pricing.js";

// Mirrors the existing create-promotion flow:
//   1. Verify business + active subscription window
//   2. Make sure run/stop dates fall within the subscription window
//   3. Compute add-on price (states/timezones beyond what the subscription covers)
//   4. Persist promotion (status pending if paid; inactive if free + auto-approve)
//   5. If priced > 0, ensure Stripe customer + create PaymentIntent
export class CreatePromotionUseCase {
  /**
   * @param {{ promotionRepo: import("../ports/promotion-repository.js").PromotionRepository,
   *          businessRepo: import("../ports/business-repository.js").BusinessRepository,
   *          subscriptionRepo: import("../ports/business-subscription-repository.js").BusinessSubscriptionRepository,
   *          payments: import("../ports/payment-gateway.js").PaymentGateway }} deps
   */
  constructor({ promotionRepo, businessRepo, subscriptionRepo, payments }) {
    this.promotionRepo = promotionRepo;
    this.businessRepo = businessRepo;
    this.subscriptionRepo = subscriptionRepo;
    this.payments = payments;
  }

  async execute({ businessId, input }) {
    const business = await this.businessRepo.findById(businessId);
    if (!business) throw new NotFoundError("Business");

    const subscription = await this.subscriptionRepo.findActiveForBusiness(businessId);
    if (!subscription || !subscription.isActive()) {
      throw new ForbiddenError("Active subscription required");
    }

    const {
      templateId,
      imageUrl,
      text,
      backgroundColor,
      category,
      categories,
      cities = [],
      states = [],
      timezones = [],
      runDate,
      stopDate,
      runTime,
      stopTime,
    } = input;

    // Accept either `category` (legacy) or `categories[]` from callers, then
    // collapse into the array shape that Supabase's Promotions table expects.
    const resolvedCategories = Array.isArray(categories) && categories.length > 0
      ? categories
      : category
        ? [category]
        : business.categories?.length
          ? [business.categories[0]]
          : [];

    const subStart = new Date(subscription.startDate);
    const subEnd = new Date(subscription.endDate);
    const run = new Date(runDate);
    const stop = new Date(stopDate);

    if (run < subStart || stop > subEnd) {
      throw new ValidationError(
        `Promotion must run within subscription period (${subStart
          .toISOString()
          .split("T")[0]} → ${subEnd.toISOString().split("T")[0]})`
      );
    }

    const { total: totalPrice, breakdown } = calculateAddOnPrice({
      states,
      timezones,
      businessType: business.businessType,
      subscription,
    });

    const promotion = await this.promotionRepo.create({
      businessId: business.id,
      templateId: templateId || null,
      imageUrl,
      text: Array.isArray(text) ? text : text ? [text] : [],
      backgroundColor: backgroundColor || "",
      categories: resolvedCategories,
      cities,
      states,
      timezones,
      runDate,
      stopDate,
      runTime,
      stopTime,
      calculatedMonths: 1,
      price: totalPrice,
      status:
        totalPrice > 0
          ? "pending"
          : business.autoApprovePromotions
          ? "inactive"
          : "pending",
      autoApprove: !!business.autoApprovePromotions,
      paymentStatus: totalPrice > 0 ? "pending" : "completed",
    });

    if (totalPrice > 0) {
      let customerId = business.stripeCustomerId;
      if (!customerId) {
        const customer = await this.payments.createCustomer({
          email: business.email,
          name: business.name,
          metadata: { businessId: business.id },
        });
        customerId = customer.id;
        await this.businessRepo.update(business.id, { stripeCustomerId: customerId });
      }

      const intent = await this.payments.createPaymentIntent({
        amountCents: Math.round(totalPrice * 100),
        customerId,
        metadata: { promotionId: promotion.id, businessId: business.id },
        description: `Promotion add-ons: ${breakdown.extraStates} extra states, ${breakdown.extraTimezones} extra timezones`,
      });

      return {
        promotion,
        clientSecret: intent.clientSecret,
        requiresPayment: true,
      };
    }

    return { promotion, clientSecret: null, requiresPayment: false };
  }
}
