import { NotFoundError } from "../../core/errors/index.js";

export class DeleteTemplateUseCase {
  constructor({ templateRepo, uploader }) {
    this.templateRepo = templateRepo;
    this.uploader = uploader;
  }

  async execute({ templateId }) {
    const template = await this.templateRepo.findById(templateId);
    if (!template) throw new NotFoundError("Template");

    if (template.cloudinaryPublicId) {
      try {
        await this.uploader.delete(template.cloudinaryPublicId);
      } catch {
        // Cloudinary deletion is best-effort; the row should still be removed.
      }
    }
    await this.templateRepo.delete(templateId);
    return { message: "Template deleted successfully" };
  }
}
