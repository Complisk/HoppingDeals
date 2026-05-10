import { ValidationError, ForbiddenError } from "../errors/index.js";

export class Promotion {
  constructor({
    id,
    businessId = null,
    templateId = null,
    imageUrl,
    text = [],
    backgroundColor = "",
    categories = [],
    cities = [],
    states = [],
    runDate,
    stopDate,
    runTime = null,
    stopTime = null,
    scheduleEnabled = false,
    scheduleTimezone = "UTC",
    scheduleStartAt = null,
    scheduleEndAt = null,
    activationJobId = null,
    expirationJobId = null,
    calculatedMonths = 1,
    timezones = [],
    price,
    status = "pending",
    autoApprove = false,
    approvedAt = null,
    paymentStatus = "pending",
    metadata = null,
    views = 0,
    clicks = 0,
    stripePaymentId = null,
    createdAt,
    updatedAt,
    business = null,
    template = null,
  }) {
    this.id = id;
    this.businessId = businessId;
    this.templateId = templateId;
    this.imageUrl = imageUrl;
    this.text = text;
    this.backgroundColor = backgroundColor;
    this.categories = Array.isArray(categories) ? categories : [];
    this.cities = cities;
    this.states = states;
    this.runDate = runDate;
    this.stopDate = stopDate;
    this.runTime = runTime;
    this.stopTime = stopTime;
    this.scheduleEnabled = scheduleEnabled;
    this.scheduleTimezone = scheduleTimezone;
    this.scheduleStartAt = scheduleStartAt;
    this.scheduleEndAt = scheduleEndAt;
    this.activationJobId = activationJobId;
    this.expirationJobId = expirationJobId;
    this.calculatedMonths = calculatedMonths;
    this.timezones = timezones;
    this.price = price;
    this.status = status;
    this.autoApprove = autoApprove;
    this.approvedAt = approvedAt;
    this.paymentStatus = paymentStatus;
    this.metadata = metadata;
    this.views = views;
    this.clicks = clicks;
    this.stripePaymentId = stripePaymentId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.business = business;
    this.template = template;
  }

  // Backwards-compat shim — older UI code reads `promotion.category` (singular).
  get category() {
    return this.categories?.[0] ?? null;
  }

  approve() {
    if (this.status !== "pending") {
      throw new ValidationError("Only pending promotions can be approved");
    }
    this.status = "inactive";
    this.approvedAt = new Date();
  }

  activate() {
    if (this.status === "pending") {
      throw new ForbiddenError(
        "Promotion is not approved yet. Please wait for admin approval or 24 hours."
      );
    }
    this.status = "active";
  }

  deactivate() {
    if (this.status === "pending") {
      throw new ValidationError(
        "Pending promotion cannot be deactivated. Approve it first."
      );
    }
    if (this.status === "expired") {
      throw new ValidationError("Expired promotion cannot be deactivated.");
    }
    this.status = "inactive";
  }

  registerPaymentSucceeded({ stripePaymentId, businessAutoApproves }) {
    this.paymentStatus = "completed";
    this.stripePaymentId = stripePaymentId;
    if (businessAutoApproves) {
      this.status = "inactive";
      this.approvedAt = new Date();
    } else {
      this.status = "pending";
    }
  }
}
