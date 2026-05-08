import { NotFoundError } from "../../core/errors/index.js";

// Admin delete bypasses the business-ownership check.
export class AdminDeletePromotionUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute({ promotionId }) {
    const promotion = await this.promotionRepo.findById(promotionId);
    if (!promotion) throw new NotFoundError("Promotion");
    await this.promotionRepo.delete(promotionId);
    return { message: "Promotion deleted successfully" };
  }
}
