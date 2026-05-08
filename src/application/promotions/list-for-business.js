export class ListBusinessPromotionsUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute({ businessId, search = "", status = "" }) {
    const validStatuses = new Set(["active", "inactive", "pending"]);
    const normalizedStatus =
      status && validStatuses.has(status.toLowerCase())
        ? status.toLowerCase()
        : null;

    return this.promotionRepo.listForBusiness(businessId, {
      search: search.trim(),
      status: normalizedStatus,
    });
  }
}
