export class ListAdminPromotionsUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute({ status, search, page = 1, limit = 10 }) {
    const { promotions, total } = await this.promotionRepo.list({
      status,
      businessSearch: search,
      page: Number(page),
      limit: Number(limit),
      includeBusiness: true,
    });

    return {
      promotions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    };
  }
}
