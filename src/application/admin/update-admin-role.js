import { NotFoundError } from "../../core/errors/index.js";

export class UpdateAdminRoleUseCase {
  constructor({ userRepo, roleRepo }) {
    this.userRepo = userRepo;
    this.roleRepo = roleRepo;
  }

  async execute({ userId, roleId, isSuperAdmin = false }) {
    const user = await this.userRepo.findById(userId);
    if (!user || user.accountType !== "admin") throw new NotFoundError("Admin");

    const patch = isSuperAdmin
      ? { isSuperAdmin: true, roleId: null }
      : { isSuperAdmin: false, roleId };
    const updated = await this.userRepo.update(userId, patch);

    let permissions = {};
    if (updated.roleId) {
      const role = await this.roleRepo.findById(updated.roleId);
      if (role) permissions = role.permissions || {};
    }

    return {
      message: "Admin role updated",
      user: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        isSuperAdmin: updated.isSuperAdmin,
        roleId: updated.roleId,
        permissions,
      },
    };
  }
}
