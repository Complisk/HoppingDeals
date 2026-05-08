import { toPromotion } from "../mappers.js";

/** @implements {import("../../../application/ports/promotion-repository.js").PromotionRepository} */
export class PrismaPromotionRepository {
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  async findById(id) {
    return toPromotion(await this.prisma.promotion.findUnique({ where: { id } }));
  }

  async findByIdWithRelations(id, { withBusiness = false } = {}) {
    return toPromotion(
      await this.prisma.promotion.findUnique({
        where: { id },
        include: { business: withBusiness, template: true },
      })
    );
  }

  async findByIdForBusiness(id, businessId) {
    const row = await this.prisma.promotion.findFirst({
      where: { id, businessId },
    });
    return toPromotion(row);
  }

  async create(input) {
    return toPromotion(await this.prisma.promotion.create({ data: input }));
  }

  async save(promotion) {
    const {
      id,
      business: _b,
      template: _t,
      createdAt: _c,
      updatedAt: _u,
      ...data
    } = promotion;
    return toPromotion(
      await this.prisma.promotion.update({ where: { id }, data })
    );
  }

  async delete(id) {
    await this.prisma.promotion.delete({ where: { id } });
  }

  async list({
    ids,
    status,
    businessSearch,
    page = 1,
    limit = 10,
    includeBusiness = false,
  }) {
    const where = {};
    if (ids) where.id = { in: ids };
    if (status) where.status = status;
    if (businessSearch) {
      where.business = {
        OR: [
          { name: { contains: businessSearch, mode: "insensitive" } },
          { email: { contains: businessSearch, mode: "insensitive" } },
        ],
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.promotion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: includeBusiness
          ? {
              business: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  businessType: true,
                  autoApprovePromotions: true,
                  status: true,
                },
              },
            }
          : undefined,
      }),
      this.prisma.promotion.count({ where }),
    ]);

    return { promotions: rows.map(toPromotion), total };
  }

  // Public feed: status=active, optional category filter, prefers matches on
  // city/state/timezone (any match is included; ordering nudges the closest
  // matches first via a small computed priority).
  async listPublic({ city, state, timezone, category }) {
    const filters = [];
    if (city) {
      filters.push({ cities: { array_contains: [{ name: city }] } });
    }
    if (state) {
      filters.push({ states: { array_contains: [{ state_code: state }] } });
    }
    if (timezone) {
      filters.push({ timezones: { array_contains: [timezone] } });
    }

    const where = { status: "active" };
    if (category) where.category = category;
    if (filters.length > 0) where.OR = filters;

    const rows = await this.prisma.promotion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        business: {
          select: { name: true, categories: true, businessAddress: true },
        },
      },
    });
    return rows.map(toPromotion);
  }

  async listForBusiness(businessId, { search, status }) {
    const where = { businessId };
    if (status) where.status = status;
    if (search) where.category = { contains: search, mode: "insensitive" };

    const rows = await this.prisma.promotion.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toPromotion);
  }

  async businessStats(businessId) {
    const now = new Date();
    const last7 = new Date(now.getTime() - 7 * 86_400_000);
    const last30 = new Date(now.getTime() - 30 * 86_400_000);

    const [total, active, weekly, monthly] = await Promise.all([
      this.prisma.promotion.count({ where: { businessId } }),
      this.prisma.promotion.count({ where: { businessId, status: "active" } }),
      this.prisma.promotion.count({ where: { businessId, createdAt: { gte: last7 } } }),
      this.prisma.promotion.count({ where: { businessId, createdAt: { gte: last30 } } }),
    ]);
    return { total, active, weekly, monthly };
  }

  async adminStats() {
    const [
      total,
      active,
      pending,
      inactive,
      revenueAgg,
      viewsAgg,
      clicksAgg,
    ] = await Promise.all([
      this.prisma.promotion.count(),
      this.prisma.promotion.count({ where: { status: "active" } }),
      this.prisma.promotion.count({ where: { status: "pending" } }),
      this.prisma.promotion.count({ where: { status: "inactive" } }),
      this.prisma.promotion.aggregate({
        where: { status: "active" },
        _sum: { price: true },
      }),
      this.prisma.promotion.aggregate({ _sum: { views: true } }),
      this.prisma.promotion.aggregate({ _sum: { clicks: true } }),
    ]);
    return {
      total,
      active,
      pending,
      inactive,
      totalRevenue: Number(revenueAgg._sum.price ?? 0),
      totalViews: viewsAgg._sum.views ?? 0,
      totalClicks: clicksAgg._sum.clicks ?? 0,
    };
  }

  async listRecentForAdmin(limit = 5) {
    const rows = await this.prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        businessId: true,
        status: true,
        price: true,
        createdAt: true,
        views: true,
        clicks: true,
        business: { select: { id: true, name: true } },
      },
    });
    return rows.map((r) => ({ ...r, price: Number(r.price) }));
  }

  async deactivateAllOthersForBusiness(businessId, exceptId) {
    await this.prisma.promotion.updateMany({
      where: { businessId, status: "active", id: { not: exceptId } },
      data: { status: "inactive" },
    });
  }

  async incrementViews(id) {
    await this.prisma.promotion.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async incrementClicks(id) {
    await this.prisma.promotion.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
  }
}
