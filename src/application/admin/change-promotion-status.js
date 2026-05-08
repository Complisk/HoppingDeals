import {
  ValidationError,
  NotFoundError,
} from "../../core/errors/index.js";

// Admin can transition a promotion to inactive/pending. Approval (pending →
// inactive) stamps approvedAt.
const VALID = new Set(["inactive", "pending"]);

export class ChangePromotionStatusUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute({ promotionId, status }) {
    if (!VALID.has(status)) {
      throw new ValidationError(
        "Invalid status. Must be one of: inactive, pending"
      );
    }

    const promotion = await this.promotionRepo.findByIdWithRelations(promotionId, {
      withBusiness: true,
    });
    if (!promotion) throw new NotFoundError("Promotion");

    const oldStatus = promotion.status;
    promotion.status = status;
    if (status === "inactive" && oldStatus === "pending") {
      promotion.approvedAt = new Date();
    }

    const saved = await this.promotionRepo.save(promotion);

    return {
      message: `Promotion status updated from ${oldStatus} to ${status}`,
      promotion: {
        id: saved.id,
        businessId: saved.businessId,
        status: saved.status,
        approvedAt: saved.approvedAt,
        createdAt: saved.createdAt,
      },
    };
  }
}
