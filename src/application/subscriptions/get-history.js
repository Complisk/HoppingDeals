export class GetSubscriptionHistoryUseCase {
  constructor({ subscriptionRepo }) {
    this.subscriptionRepo = subscriptionRepo;
  }

  async execute({ businessId, page = 1, limit = 10 }) {
    const { items, total } = await this.subscriptionRepo.listForBusiness(
      businessId,
      { page: Number(page), limit: Number(limit) }
    );
    return {
      data: items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    };
  }
}
