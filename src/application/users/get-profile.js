import { NotFoundError } from "../../core/errors/index.js";

export class GetUserProfileUseCase {
  constructor({ userRepo }) {
    this.userRepo = userRepo;
  }

  async execute({ userId }) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");
    return user.toPublicJSON();
  }
}
