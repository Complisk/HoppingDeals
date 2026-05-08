import { NotFoundError, ConflictError, ValidationError } from "../../core/errors/index.js";

export class AddToWishlistUseCase {
  constructor({ userRepo, promotionRepo }) {
    this.userRepo = userRepo;
    this.promotionRepo = promotionRepo;
  }

  async execute({ userId, promotionId }) {
    if (!promotionId) throw new ValidationError("Promotion ID is required");

    const promotion = await this.promotionRepo.findById(promotionId);
    if (!promotion) throw new NotFoundError("Promotion");

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");

    if (user.wishlist.includes(promotionId)) {
      throw new ConflictError("Promotion already in wishlist");
    }

    const updated = await this.userRepo.update(userId, {
      wishlist: [...user.wishlist, promotionId],
    });
    return { message: "Added to wishlist", wishlist: updated.wishlist };
  }
}

export class RemoveFromWishlistUseCase {
  constructor({ userRepo }) {
    this.userRepo = userRepo;
  }

  async execute({ userId, promotionId }) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");

    const updated = await this.userRepo.update(userId, {
      wishlist: user.wishlist.filter((id) => id !== promotionId),
    });
    return { message: "Removed from wishlist", wishlist: updated.wishlist };
  }
}

export class GetWishlistUseCase {
  constructor({ userRepo, promotionRepo }) {
    this.userRepo = userRepo;
    this.promotionRepo = promotionRepo;
  }

  async execute({ userId }) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");
    if (!user.wishlist.length) return [];

    const { promotions } = await this.promotionRepo.list({
      ids: user.wishlist,
    });
    return promotions;
  }
}
