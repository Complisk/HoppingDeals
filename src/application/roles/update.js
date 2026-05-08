import {
  NotFoundError,
  ForbiddenError,
} from "../../core/errors/index.js";

export class UpdateRoleUseCase {
  constructor({ roleRepo }) {
    this.roleRepo = roleRepo;
  }

  async execute({ id, permissions }) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundError("Role");
    if (role.isSystem) throw new ForbiddenError("System role locked");

    const updated = await this.roleRepo.update(id, { permissions });
    return { message: "Role updated", role: updated };
  }
}
