import {
  ConflictError,
  ValidationError,
  NotFoundError,
} from "../../core/errors/index.js";

export class CreateAdminUserUseCase {
  /**
   * @param {{ userRepo: import("../ports/user-repository.js").UserRepository,
   *          roleRepo: import("../ports/role-repository.js").RoleRepository,
   *          hasher: import("../ports/password-hasher.js").PasswordHasher }} deps
   */
  constructor({ userRepo, roleRepo, hasher }) {
    this.userRepo = userRepo;
    this.roleRepo = roleRepo;
    this.hasher = hasher;
  }

  async execute({ fullName, email, password, roleId, isSuperAdmin = false }) {
    if (!fullName || !email || !password) {
      throw new ValidationError("Required fields missing");
    }

    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new ConflictError("Email already exists");

    let permissions = {};
    if (!isSuperAdmin) {
      if (!roleId) throw new ValidationError("roleId is required when not super admin");
      const role = await this.roleRepo.findById(roleId);
      if (!role) throw new NotFoundError("Role");
      permissions = role.permissions || {};
    }

    const passwordHash = await this.hasher.hash(password);
    const user = await this.userRepo.create({
      fullName,
      email,
      password: passwordHash,
      accountType: "admin",
      isSuperAdmin: !!isSuperAdmin,
      roleId: isSuperAdmin ? null : roleId,
      status: "active",
    });

    return {
      message: "Admin user created successfully",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        roleId: user.roleId,
        permissions,
      },
    };
  }
}
