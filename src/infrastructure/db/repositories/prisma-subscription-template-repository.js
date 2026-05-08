import { toSubscriptionTemplate } from "../mappers.js";

/** @implements {import("../../../application/ports/subscription-template-repository.js").SubscriptionTemplateRepository} */
export class PrismaSubscriptionTemplateRepository {
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  async findById(id) {
    return toSubscriptionTemplate(
      await this.prisma.subscriptionTemplate.findUnique({ where: { id } })
    );
  }

  async list() {
    const rows = await this.prisma.subscriptionTemplate.findMany({
      orderBy: { price: "asc" },
    });
    return rows.map(toSubscriptionTemplate);
  }

  async create(input) {
    return toSubscriptionTemplate(
      await this.prisma.subscriptionTemplate.create({ data: input })
    );
  }

  async update(id, patch) {
    return toSubscriptionTemplate(
      await this.prisma.subscriptionTemplate.update({ where: { id }, data: patch })
    );
  }
}
