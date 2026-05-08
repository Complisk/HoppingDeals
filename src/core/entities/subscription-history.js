export class SubscriptionHistory {
  constructor({
    id,
    businessId,
    stripeSubscriptionId = null,
    stripePriceId = null,
    businessType = null,
    months = null,
    startDate = null,
    endDate = null,
    status = "active",
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.businessId = businessId;
    this.stripeSubscriptionId = stripeSubscriptionId;
    this.stripePriceId = stripePriceId;
    this.businessType = businessType;
    this.months = months;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
