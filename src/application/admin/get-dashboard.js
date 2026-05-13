export class GetAdminDashboardUseCase {
  constructor({ userRepo, businessRepo, promotionRepo }) {
    this.userRepo = userRepo;
    this.businessRepo = businessRepo;
    this.promotionRepo = promotionRepo;
  }

  async execute() {
    const [users, businesses, promotions, recentUsers, recentPromotions] =
      await Promise.all([
        this.userRepo.countByStatus(),
        this.businessRepo.countByStatus(),
        this.promotionRepo.adminStats(),
        this.userRepo.listRecent(5),
        this.promotionRepo.listRecentForAdmin(5),
      ]);

    const totalViews = promotions.totalViews || 0;
    const totalClicks = promotions.totalClicks || 0;

    return {
      users,
      businesses,
      promotions: {
        total: promotions.total,
        active: promotions.active,
        pending: promotions.pending,
        inactive: promotions.inactive,
      },
      revenue: { total: Number(promotions.totalRevenue) || 0 },
      engagement: {
        totalViews,
        totalClicks,
        clickThroughRate: totalViews
          ? ((totalClicks / totalViews) * 100).toFixed(2)
          : 0,
      },
      recentActivity: {
        users: recentUsers.map((u) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          role: u.isSuperAdmin
            ? "Super Admin"
            : u.role?.name || u.accountType || "user",
          status: u.status,
          createdAt: u.createdAt,
        })),
        promotions: recentPromotions,
      },
    };
  }
}
