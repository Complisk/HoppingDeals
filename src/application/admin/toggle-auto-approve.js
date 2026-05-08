import { NotFoundError } from "../../core/errors/index.js";

export class ToggleBusinessAutoApproveUseCase {
  constructor({ businessRepo }) {
    this.businessRepo = businessRepo;
  }

  async execute({ businessId, autoApprovePromotions }) {
    const business = await this.businessRepo.findById(businessId);
    if (!business) throw new NotFoundError("Business");

    const updated = await this.businessRepo.update(businessId, {
      autoApprovePromotions: !!autoApprovePromotions,
    });
    return {
      message: `Business auto-approve ${updated.autoApprovePromotions ? "enabled" : "disabled"}`,
      business: updated.toPublicJSON(),
    };
  }
}
