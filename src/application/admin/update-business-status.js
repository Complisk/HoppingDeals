import {
  ValidationError,
  NotFoundError,
} from "../../core/errors/index.js";

const VALID = new Set(["active", "inactive", "blocked", "suspended"]);

export class UpdateBusinessStatusUseCase {
  constructor({ businessRepo }) {
    this.businessRepo = businessRepo;
  }

  async execute({ businessId, status }) {
    if (!VALID.has(status)) {
      throw new ValidationError(
        "Invalid status. Must be one of: active, inactive, blocked, suspended"
      );
    }

    const business = await this.businessRepo.findById(businessId);
    if (!business) throw new NotFoundError("Business");

    const oldStatus = business.status;
    const updated = await this.businessRepo.update(businessId, { status });

    return {
      message: `Business status updated from ${oldStatus} to ${status}`,
      business: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        status: updated.status,
      },
    };
  }
}
