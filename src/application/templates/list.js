export class ListTemplatesUseCase {
  constructor({ templateRepo }) {
    this.templateRepo = templateRepo;
  }

  execute() {
    return this.templateRepo.list();
  }
}
