import { NotFoundError } from "../../core/errors/index.js";

export class GetBusinessPromotionUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute({ businessId, promotionId }) {
    const promotion = await this.promotionRepo.findByIdForBusiness(
      promotionId,
      businessId
    );
    if (!promotion) throw new NotFoundError("Promotion");
    return promotion;
  }
}
