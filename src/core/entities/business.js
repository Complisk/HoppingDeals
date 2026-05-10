export class Business {
  constructor({
    id,
    name,
    email,
    password,
    phone = null,
    logoUrl = null,
    businessType = "small",
    categories = [],
    personName = null,
    businessAddress = null,
    placeId = null,
    lat = null,
    lng = null,
    state = null,
    timezone = "UTC",
    autoApprovePromotions = false,
    status = "active",
    subscriptionStatus = "none",
    subscriptionStart = null,
    subscriptionEnd = null,
    stripeSubscriptionId = null,
    stripeCustomerId = null,
    coordinates = null,
    resetPasswordToken = null,
    resetPasswordExpires = null,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.logoUrl = logoUrl;
    this.businessType = businessType;
    this.categories = categories;
    this.personName = personName;
    this.businessAddress = businessAddress;
    this.placeId = placeId;
    this.lat = lat;
    this.lng = lng;
    this.state = state;
    this.timezone = timezone;
    this.autoApprovePromotions = autoApprovePromotions;
    this.status = status;
    this.subscriptionStatus = subscriptionStatus;
    this.subscriptionStart = subscriptionStart;
    this.subscriptionEnd = subscriptionEnd;
    this.stripeSubscriptionId = stripeSubscriptionId;
    this.stripeCustomerId = stripeCustomerId;
    this.coordinates = coordinates;
    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpires = resetPasswordExpires;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isOnlineStore() {
    return this.businessType === "online-ecommerce" || this.businessType === "online_ecommerce";
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
    const {
      password: _password,
      resetPasswordToken: _t,
      resetPasswordExpires: _e,
      ...rest
    } = this;
    return rest;
  }
}
