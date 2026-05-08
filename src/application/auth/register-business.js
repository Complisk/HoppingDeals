import { ConflictError, ValidationError } from "../../core/errors/index.js";

export class RegisterBusinessUseCase {
  /**
   * @param {{ businessRepo: import("../ports/business-repository.js").BusinessRepository,
   *          hasher: import("../ports/password-hasher.js").PasswordHasher,
   *          tokens: import("../ports/token-service.js").TokenService }} deps
   */
  constructor({ businessRepo, hasher, tokens }) {
    this.businessRepo = businessRepo;
    this.hasher = hasher;
    this.tokens = tokens;
  }

  async execute(input) {
    const {
      name,
      email,
      password,
      phone,
      categories,
      businessType,
      personName,
      businessAddress,
    } = input;

    const existing = await this.businessRepo.findByEmail(email);
    if (existing) throw new ConflictError("Business already exists");

    if (!Array.isArray(categories) || categories.length === 0 || categories.length > 2) {
      throw new ValidationError("Please select 1 or 2 business categories");
    }

    const passwordHash = await this.hasher.hash(password);

    const business = await this.businessRepo.create({
      name,
      email,
      password: passwordHash,
      phone,
      categories,
      businessType: businessType || "small",
      personName: personName || null,
      businessAddress: businessAddress || null,
      autoApprovePromotions: false,
    });

    const token = await this.tokens.sign({ id: business.id, type: "business" });

    return {
      ...business.toPublicJSON(),
      token,
    };
  }
}
