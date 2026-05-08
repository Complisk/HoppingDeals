import { toBusinessSubscription } from "../mappers.js";

/** @implements {import("../../../application/ports/business-subscription-repository.js").BusinessSubscriptionRepository} */
export class PrismaBusinessSubscriptionRepository {
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  async findActiveForBusiness(businessId) {
    const row = await this.prisma.businessSubscription.findFirst({
      where: { businessId, status: "active" },
      orderBy: { endDate: "desc" },
      include: {
        template: {
          select: { name: true, durationMonths: true, price: true },
        },
      },
    });
    return toBusinessSubscription(row);
  }

  async listForBusiness(businessId, { page = 1, limit = 10 }) {
    const [rows, total] = await Promise.all([
      this.prisma.businessSubscription.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.businessSubscription.count({ where: { businessId } }),
    ]);
    return { items: rows.map(toBusinessSubscription), total };
  }

  async create(input) {
    return toBusinessSubscription(
      await this.prisma.businessSubscription.create({ data: input })
    );
  }

  async expireAllActiveForBusiness(businessId) {
    await this.prisma.businessSubscription.updateMany({
      where: { businessId, status: "active" },
      data: { status: "expired" },
    });
  }
}
