import { toRole } from "../mappers.js";

/** @implements {import("../../../application/ports/role-repository.js").RoleRepository} */
export class PrismaRoleRepository {
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  async findById(id) {
    return toRole(await this.prisma.role.findUnique({ where: { id } }));
  }

  async findByName(name) {
    return toRole(await this.prisma.role.findUnique({ where: { name } }));
  }

  async list() {
    const rows = await this.prisma.role.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toRole);
  }

  async create(input) {
    return toRole(await this.prisma.role.create({ data: input }));
  }

  async update(id, patch) {
    return toRole(await this.prisma.role.update({ where: { id }, data: patch }));
  }

  async delete(id) {
    await this.prisma.role.delete({ where: { id } });
  }
}
