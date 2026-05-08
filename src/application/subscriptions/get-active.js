export class GetActiveSubscriptionUseCase {
  constructor({ subscriptionRepo }) {
    this.subscriptionRepo = subscriptionRepo;
  }

  async execute({ businessId }) {
    return (await this.subscriptionRepo.findActiveForBusiness(businessId)) ?? null;
  }
}
