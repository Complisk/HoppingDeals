import {
  ValidationError,
  ConflictError,
} from "../../core/errors/index.js";
import { PERMISSION_MAP } from "./permission-map.js";

export class CreateRoleUseCase {
  constructor({ roleRepo }) {
    this.roleRepo = roleRepo;
  }

  async execute({ name, permissions }) {
    if (!name || !permissions) throw new ValidationError("Required fields missing");

    const existing = await this.roleRepo.findByName(name);
    if (existing) throw new ConflictError("Role already exists");

    for (const module of Object.keys(permissions)) {
      if (!PERMISSION_MAP[module]) throw new ValidationError("Invalid module");
      for (const action of permissions[module]) {
        if (!PERMISSION_MAP[module].includes(action)) {
          throw new ValidationError("Invalid permission action");
        }
      }
    }

    return this.roleRepo.create({ name, permissions });
  }
}
