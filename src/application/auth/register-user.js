import { ConflictError } from "../../core/errors/index.js";

export class RegisterUserUseCase {
  /**
   * @param {{ userRepo: import("../ports/user-repository.js").UserRepository,
   *          hasher: import("../ports/password-hasher.js").PasswordHasher,
   *          tokens: import("../ports/token-service.js").TokenService }} deps
   */
  constructor({ userRepo, hasher, tokens }) {
    this.userRepo = userRepo;
    this.hasher = hasher;
    this.tokens = tokens;
  }

  async execute({ fullName, email, password }) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new ConflictError("User already exists");

    const passwordHash = await this.hasher.hash(password);
    const user = await this.userRepo.create({
      fullName,
      email,
      password: passwordHash,
      accountType: "user",
    });

    const token = await this.tokens.sign({ id: user.id, type: "user" });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: "user",
      token,
    };
  }
}
