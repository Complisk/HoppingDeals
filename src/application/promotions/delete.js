import { NotFoundError } from "../../core/errors/index.js";

export class DeletePromotionUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute({ businessId, promotionId }) {
    const promotion = await this.promotionRepo.findByIdForBusiness(
      promotionId,
      businessId
    );
    if (!promotion) throw new NotFoundError("Promotion");
    await this.promotionRepo.delete(promotionId);
    return { message: "Promotion deleted" };
  }
}
