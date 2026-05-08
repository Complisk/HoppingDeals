export class SubscriptionTemplate {
  constructor({
    id,
    name,
    durationMonths,
    price,
    freeCities = 2,
    freeStates = 0,
    freeTimezones = 0,
    isActive = true,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.durationMonths = durationMonths;
    this.price = price;
    this.freeCities = freeCities;
    this.freeStates = freeStates;
    this.freeTimezones = freeTimezones;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
