import {
  NotFoundError,
  ForbiddenError,
} from "../../core/errors/index.js";

export class DeleteRoleUseCase {
  constructor({ roleRepo }) {
    this.roleRepo = roleRepo;
  }

  async execute({ id }) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundError("Role");
    if (role.isSystem) throw new ForbiddenError("System role locked");

    await this.roleRepo.delete(id);
    return { message: "Role deleted" };
  }
}
