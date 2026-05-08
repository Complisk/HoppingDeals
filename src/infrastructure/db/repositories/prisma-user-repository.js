import { toUser } from "../mappers.js";

/** @implements {import("../../../application/ports/user-repository.js").UserRepository} */
export class PrismaUserRepository {
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  async findById(id) {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return toUser(row);
  }

  async findByEmail(email) {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return toUser(row);
  }

  async findByIdWithRole(id) {
    const row = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    return toUser(row);
  }

  async findByEmailWithRole(email) {
    const row = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    return toUser(row);
  }

  async create(input) {
    const row = await this.prisma.user.create({ data: input });
    return toUser(row);
  }

  async update(id, patch) {
    const row = await this.prisma.user.update({ where: { id }, data: patch });
    return toUser(row);
  }

  async delete(id) {
    await this.prisma.user.delete({ where: { id } });
  }

  async list({ search, accountType, status, page = 1, limit = 10 }) {
    const where = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (accountType) where.accountType = accountType;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { users: users.map(toUser), total };
  }

  async countByStatus() {
    const [total, active, blocked, suspended] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: "active" } }),
      this.prisma.user.count({ where: { status: "blocked" } }),
      this.prisma.user.count({ where: { status: "suspended" } }),
    ]);
    return { total, active, blocked, suspended };
  }

  async listRecent(limit = 5) {
    const rows = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(toUser);
  }
}
