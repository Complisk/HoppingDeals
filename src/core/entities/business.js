export class Business {
  constructor({
    id,
    name,
    email,
    password,
    phone,
    businessType = "small",
    categories = [],
    personName = null,
    businessAddress = null,
    state = null,
    autoApprovePromotions = false,
    status = "active",
    subscriptionStatus = "none",
    subscriptionStart = null,
    subscriptionEnd = null,
    stripeSubscriptionId = null,
    stripeCustomerId = null,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.businessType = businessType;
    this.categories = categories;
    this.personName = personName;
    this.businessAddress = businessAddress;
    this.state = state;
    this.autoApprovePromotions = autoApprovePromotions;
    this.status = status;
    this.subscriptionStatus = subscriptionStatus;
    this.subscriptionStart = subscriptionStart;
    this.subscriptionEnd = subscriptionEnd;
    this.stripeSubscriptionId = stripeSubscriptionId;
    this.stripeCustomerId = stripeCustomerId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isOnlineStore() {
    return this.businessType === "online-ecommerce";
  }

  hasActiveSubscriptionWindow(now = new Date()) {
    return (
      this.subscriptionStatus === "active" &&
      this.subscriptionStart &&
      this.subscriptionEnd &&
      new Date(this.subscriptionEnd) >= now
    );
  }

  toPublicJSON() {
    const { password: _password, ...rest } = this;
    return rest;
  }
}
