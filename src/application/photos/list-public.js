export class ListPublicPhotosUseCase {
  constructor({ photoRepo }) {
    this.photoRepo = photoRepo;
  }

  execute() {
    return this.photoRepo.listPublic();
  }
}
