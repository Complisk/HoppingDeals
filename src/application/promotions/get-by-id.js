import { NotFoundError } from "../../core/errors/index.js";

export class GetPromotionByIdUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute({ id, incrementView = false }) {
    const promotion = await this.promotionRepo.findByIdWithRelations(id, {
      withBusiness: true,
    });
    if (!promotion) throw new NotFoundError("Promotion");

    if (incrementView) {
      await this.promotionRepo.incrementViews(id);
      promotion.views += 1;
    }
    return promotion;
  }
}
