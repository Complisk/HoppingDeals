// Public promotion feed (homepage / category pages).
// Mirrors the live Express contract: paginated payload with success flag.
export class ListPublicPromotionsUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute(input = {}) {
    const page = Number(input.page) > 0 ? Number(input.page) : 1;
    const limit = Number(input.limit) > 0 ? Number(input.limit) : 20;

    const { rows, total } = await this.promotionRepo.listPublic({
      countryCode: input.countryCode || undefined,
      city: input.city || undefined,
      state: input.state || undefined,
      timezone: input.timezone || undefined,
      category: input.category || undefined,
      categories: input.categories || undefined,
      page,
      limit,
    });

    return {
      success: true,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      promotions: rows,
    };
  }
}
