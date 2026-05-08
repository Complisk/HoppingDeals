export class BusinessSubscription {
  constructor({
    id,
    businessId,
    subscriptionTemplateId,
    startDate = null,
    endDate = null,
    freeCities = null,
    freeStates = null,
    freeTimezones = null,
    status = "active",
    stripeSubscriptionId = null,
    createdAt,
    updatedAt,
    template = null,
  }) {
    this.id = id;
    this.businessId = businessId;
    this.subscriptionTemplateId = subscriptionTemplateId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.freeCities = freeCities;
    this.freeStates = freeStates;
    this.freeTimezones = freeTimezones;
    this.status = status;
    this.stripeSubscriptionId = stripeSubscriptionId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.template = template;
  }

  isActive(now = new Date()) {
    return (
      this.status === "active" &&
      this.startDate &&
      this.endDate &&
      new Date(this.endDate) >= now
    );
  }

  contains(date) {
    if (!this.startDate || !this.endDate) return false;
    const d = new Date(date);
    return new Date(this.startDate) <= d && d <= new Date(this.endDate);
  }
}
