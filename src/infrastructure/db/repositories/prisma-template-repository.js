import { toTemplate } from "../mappers.js";

/** @implements {import("../../../application/ports/template-repository.js").TemplateRepository} */
export class PrismaTemplateRepository {
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  async findById(id) {
    return toTemplate(await this.prisma.template.findUnique({ where: { id } }));
  }

  async list() {
    const rows = await this.prisma.template.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toTemplate);
  }

  async create(input) {
    return toTemplate(await this.prisma.template.create({ data: input }));
  }

  async delete(id) {
    await this.prisma.template.delete({ where: { id } });
  }
}
