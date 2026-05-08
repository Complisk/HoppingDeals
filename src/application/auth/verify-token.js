import {
  UnauthorizedError,
  ForbiddenError,
} from "../../core/errors/index.js";

// Resolves a JWT to a hydrated user/business with role enforcement.
// Replaces the `protect(role)` middleware in the old backend.
export class VerifyTokenUseCase {
  /**
   * @param {{ userRepo: import("../ports/user-repository.js").UserRepository,
   *          businessRepo: import("../ports/business-repository.js").BusinessRepository,
   *          tokens: import("../ports/token-service.js").TokenService }} deps
   */
  constructor({ userRepo, businessRepo, tokens }) {
    this.userRepo = userRepo;
    this.businessRepo = businessRepo;
    this.tokens = tokens;
  }

  /** @param {{ token: string, requiredRole?: "user" | "business" | "admin" }} input */
  async execute({ token, requiredRole }) {
    if (!token) throw new UnauthorizedError("No token provided");

    let payload;
    try {
      payload = await this.tokens.verify(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }

    if (payload.type === "business") {
      const business = await this.businessRepo.findById(payload.id);
      if (!business) throw new UnauthorizedError("Business not found");
      if (business.status === "blocked")
        throw new ForbiddenError("Business account is blocked");
      if (requiredRole && requiredRole !== "business") {
        throw new ForbiddenError(`Only ${requiredRole} access allowed`);
      }
      return { kind: "business", business };
    }

    const user = await this.userRepo.findByIdWithRole(payload.id);
    if (!user) throw new UnauthorizedError("User not found");
    if (["blocked", "suspended"].includes(user.status)) {
      throw new ForbiddenError("Account is blocked or suspended");
    }

    const userType =
      user.role?.name === "admin" || user.isSuperAdmin ? "admin" : "user";
    if (requiredRole && requiredRole !== userType) {
      throw new ForbiddenError(`Only ${requiredRole} access allowed`);
    }

    return { kind: userType, user };
  }
}
