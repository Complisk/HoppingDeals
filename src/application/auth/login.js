import {
  UnauthorizedError,
  ForbiddenError,
} from "../../core/errors/index.js";

export class LoginUseCase {
  /**
   * @param {{ userRepo: import("../ports/user-repository.js").UserRepository,
   *          businessRepo: import("../ports/business-repository.js").BusinessRepository,
   *          hasher: import("../ports/password-hasher.js").PasswordHasher,
   *          tokens: import("../ports/token-service.js").TokenService }} deps
   */
  constructor({ userRepo, businessRepo, hasher, tokens }) {
    this.userRepo = userRepo;
    this.businessRepo = businessRepo;
    this.hasher = hasher;
    this.tokens = tokens;
  }

  async execute({ email, password, type = "user" }) {
    if (type === "business") return this.#loginBusiness({ email, password });
    return this.#loginUserOrAdmin({ email, password, type });
  }

  async #loginBusiness({ email, password }) {
    const business = await this.businessRepo.findByEmail(email);
    if (!business) throw new UnauthorizedError("Invalid credentials");

    const ok = await this.hasher.compare(password, business.password);
    if (!ok) throw new UnauthorizedError("Invalid credentials");

    const token = await this.tokens.sign({ id: business.id, type: "business" });
    return { ...business.toPublicJSON(), token };
  }

  async #loginUserOrAdmin({ email, password, type }) {
    const user =
      type === "admin"
        ? await this.userRepo.findByEmailWithRole(email)
        : await this.userRepo.findByEmail(email);
    if (!user) throw new UnauthorizedError("Invalid credentials");
    if (user.status === "blocked") throw new ForbiddenError("Account is blocked");

    const ok = await this.hasher.compare(password, user.password);
    if (!ok) throw new UnauthorizedError("Invalid credentials");

    const token = await this.tokens.sign({ id: user.id, type });

    const base = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      token,
    };

    if (type === "admin") {
      base.isSuperAdmin = user.isSuperAdmin;
      if (user.isSuperAdmin) {
        base.role = { name: "SuperAdmin", permissions: "ALL" };
      } else {
        base.role = user.role
          ? {
              id: user.role.id,
              name: user.role.name,
              permissions: user.role.permissions,
            }
          : null;
      }
    } else {
      base.role = "user";
    }

    return base;
  }
}
