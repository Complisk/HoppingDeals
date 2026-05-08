import { NotFoundError } from "../../core/errors/index.js";

// Only image / text / backgroundColor / runTime / stopTime are editable.
// Location, dates, and price are intentionally locked once created.
export class UpdatePromotionUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute({ businessId, promotionId, patch }) {
    const promotion = await this.promotionRepo.findByIdForBusiness(
      promotionId,
      businessId
    );
    if (!promotion) throw new NotFoundError("Promotion");

    const allowed = {};
    if (patch.imageUrl !== undefined) allowed.imageUrl = patch.imageUrl;
    if (patch.text !== undefined) {
      allowed.text = Array.isArray(patch.text) ? patch.text : [patch.text];
    }
    if (patch.backgroundColor !== undefined) {
      allowed.backgroundColor = patch.backgroundColor;
    }
    if (patch.runTime !== undefined) allowed.runTime = patch.runTime;
    if (patch.stopTime !== undefined) allowed.stopTime = patch.stopTime;

    Object.assign(promotion, allowed);
    return this.promotionRepo.save(promotion);
  }
}
