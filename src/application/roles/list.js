export class ListRolesUseCase {
  constructor({ roleRepo }) {
    this.roleRepo = roleRepo;
  }

  execute() {
    return this.roleRepo.list();
  }
}
