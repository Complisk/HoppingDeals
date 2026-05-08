export class ListAdminBusinessesUseCase {
  constructor({ businessRepo }) {
    this.businessRepo = businessRepo;
  }

  async execute({ search, status, autoApprove, page = 1, limit = 10 }) {
    const { businesses, total } = await this.businessRepo.list({
      search,
      status,
      autoApprovePromotions:
        autoApprove === undefined
          ? undefined
          : autoApprove === true || autoApprove === "true",
      page: Number(page),
      limit: Number(limit),
    });

    return {
      businesses: businesses.map((b) => b.toPublicJSON()),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    };
  }
}
