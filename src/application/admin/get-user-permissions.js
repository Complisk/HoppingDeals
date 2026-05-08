import { NotFoundError } from "../../core/errors/index.js";

export class GetUserPermissionsUseCase {
  constructor({ userRepo }) {
    this.userRepo = userRepo;
  }

  async execute({ userId }) {
    const user = await this.userRepo.findByIdWithRole(userId);
    if (!user) throw new NotFoundError("User");

    return {
      isSuperAdmin: user.isSuperAdmin,
      roleId: user.roleId,
      permissions: user.isSuperAdmin
        ? {}
        : user.role?.permissions || {},
      role: user.role?.name || null,
      email: user.email,
    };
  }
}
