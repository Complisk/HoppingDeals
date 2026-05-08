import {
  ValidationError,
  NotFoundError,
} from "../../core/errors/index.js";

const VALID = new Set(["active", "inactive", "blocked", "suspended"]);

export class UpdateUserStatusUseCase {
  constructor({ userRepo }) {
    this.userRepo = userRepo;
  }

  async execute({ userId, status }) {
    if (!VALID.has(status)) {
      throw new ValidationError(
        "Invalid status. Must be one of: active, inactive, blocked, suspended"
      );
    }

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");

    const oldStatus = user.status;
    const updated = await this.userRepo.update(userId, { status });

    return {
      message: `User status updated from ${oldStatus} to ${status}`,
      user: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        status: updated.status,
      },
    };
  }
}
