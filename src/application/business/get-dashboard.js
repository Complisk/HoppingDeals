const clamp = (value, max) => Math.min(value, max);

export class GetBusinessDashboardUseCase {
  constructor({ promotionRepo }) {
    this.promotionRepo = promotionRepo;
  }

  async execute({ businessId }) {
    const stats = await this.promotionRepo.businessStats(businessId);

    const score = clamp(Math.floor((stats.total / 25) * 100), 100);
    const level = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
    const message =
      level === "High"
        ? "Excellent promotion consistency"
        : level === "Medium"
        ? "Keep up the momentum!"
        : "Run promotions more frequently to improve momentum";

    return {
      response: {
        stats: {
          totalPromotions: stats.total,
          activePromotions: stats.active,
        },
        chartData: {
          weekly: stats.weekly,
          monthly: stats.monthly,
          momentum: { score, level, message },
        },
      },
    };
  }
}
