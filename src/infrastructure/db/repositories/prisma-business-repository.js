import { toBusiness } from "../mappers.js";

/** @implements {import("../../../application/ports/business-repository.js").BusinessRepository} */
export class PrismaBusinessRepository {
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  async findById(id) {
    const row = await this.prisma.business.findUnique({ where: { id } });
    return toBusiness(row);
  }

  async findByEmail(email) {
    const row = await this.prisma.business.findUnique({ where: { email } });
    return toBusiness(row);
  }

  async create(input) {
    const row = await this.prisma.business.create({ data: input });
    return toBusiness(row);
  }

  async update(id, patch) {
    const row = await this.prisma.business.update({ where: { id }, data: patch });
    return toBusiness(row);
  }

  async delete(id) {
    await this.prisma.business.delete({ where: { id } });
  }

  async list({
    search,
    status,
    autoApprovePromotions,
    page = 1,
    limit = 10,
  }) {
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;
    if (autoApprovePromotions !== undefined) {
      where.autoApprovePromotions = autoApprovePromotions;
    }

    const [businesses, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.business.count({ where }),
    ]);
    return { businesses: businesses.map(toBusiness), total };
  }

  async countByStatus() {
    const [total, active, blocked, withAutoApprove] = await Promise.all([
      this.prisma.business.count(),
      this.prisma.business.count({ where: { status: "active" } }),
      this.prisma.business.count({ where: { status: "blocked" } }),
      this.prisma.business.count({ where: { autoApprovePromotions: true } }),
    ]);
    return { total, active, blocked, withAutoApprove };
  }
}
