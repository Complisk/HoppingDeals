import { NotFoundError } from "../../core/errors/index.js";

// Activating one promotion deactivates any others currently active for the
// business — only one promo runs at a time.
export class ActivatePromotionUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute({ businessId, promotionId }) {
    const promotion = await this.promotionRepo.findByIdForBusiness(
      promotionId,
      businessId
    );
    if (!promotion) throw new NotFoundError("Promotion");

    promotion.activate();
    await this.promotionRepo.deactivateAllOthersForBusiness(
      businessId,
      promotionId
    );
    const saved = await this.promotionRepo.save(promotion);
    return { message: "Promotion activated successfully", promotion: saved };
  }
}
