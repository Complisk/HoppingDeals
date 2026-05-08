import { NotFoundError } from "../../core/errors/index.js";

export class IncrementPromotionClickUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute({ id }) {
    const promotion = await this.promotionRepo.findById(id);
    if (!promotion) throw new NotFoundError("Promotion");
    await this.promotionRepo.incrementClicks(id);
    return { message: "Click recorded" };
  }
}
