import { NotFoundError } from "../../core/errors/index.js";

export class DeactivatePromotionUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute({ businessId, promotionId }) {
    const promotion = await this.promotionRepo.findByIdForBusiness(
      promotionId,
      businessId
    );
    if (!promotion) throw new NotFoundError("Promotion");

    promotion.deactivate();
    const saved = await this.promotionRepo.save(promotion);
    return { message: "Promotion successfully deactivated", promotion: saved };
  }
}
