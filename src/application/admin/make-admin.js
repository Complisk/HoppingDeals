import { NotFoundError } from "../../core/errors/index.js";

export class MakeAdminUseCase {
  constructor({ userRepo, roleRepo }) {
    this.userRepo = userRepo;
    this.roleRepo = roleRepo;
  }

  async execute({ userId, roleId }) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");

    const role = await this.roleRepo.findById(roleId);
    if (!role) throw new NotFoundError("Role");

    await this.userRepo.update(userId, {
      accountType: "admin",
      roleId: role.id,
    });
    return { message: "User promoted to admin" };
  }
}
