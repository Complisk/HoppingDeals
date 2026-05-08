export class ListAdminUsersUseCase {
  constructor({ userRepo }) {
    this.userRepo = userRepo;
  }

  async execute({ search, role, status, page = 1, limit = 10 }) {
    const { users, total } = await this.userRepo.list({
      search,
      accountType: role,
      status,
      page: Number(page),
      limit: Number(limit),
    });

    return {
      users: users.map((u) => u.toPublicJSON()),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    };
  }
}
