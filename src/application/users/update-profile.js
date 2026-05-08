import { NotFoundError } from "../../core/errors/index.js";

export class UpdateUserProfileUseCase {
  constructor({ userRepo }) {
    this.userRepo = userRepo;
  }

  async execute({ userId, patch }) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");

    const allowed = {};
    if (patch.fullName !== undefined) allowed.fullName = patch.fullName;
    // Other fields (city/state) referenced in the old controller don't exist in
    // the User schema, so they're intentionally dropped.

    const updated = await this.userRepo.update(userId, allowed);
    return updated.toPublicJSON();
  }
}
