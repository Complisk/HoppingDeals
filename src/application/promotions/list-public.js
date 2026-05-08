// Public promotion feed (homepage / category pages).
export class ListPublicPromotionsUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  /** @param {{ city?: string, state?: string, timezone?: string, category?: string }} input */
  async execute(input = {}) {
    return this.promotionRepo.listPublic(input);
  }
}
