import { ValidationError } from "../../core/errors/index.js";

export class UploadTemplatesUseCase {
  /**
   * @param {{ templateRepo: import("../ports/template-repository.js").TemplateRepository,
   *          uploader: import("../ports/image-uploader.js").ImageUploader }} deps
   */
  constructor({ templateRepo, uploader }) {
    this.templateRepo = templateRepo;
    this.uploader = uploader;
  }

  /** @param {{ files: Array<{ buffer: Buffer, originalName: string }> }} input */
  async execute({ files }) {
    if (!files || files.length === 0) {
      throw new ValidationError("No images provided");
    }

    const created = [];
    for (const file of files) {
      let uploaded;
      try {
        uploaded = await this.uploader.upload(file.buffer, "templates");
      } catch {
        continue;
      }

      const baseName = file.originalName.split(".")[0];
      const template = await this.templateRepo.create({
        name: `${baseName}-${Date.now()}`,
        imageUrl: uploaded.url,
        cloudinaryPublicId: uploaded.publicId,
        isDefault: false,
      });
      created.push({
        id: template.id,
        name: template.name,
        imageUrl: template.imageUrl,
      });
    }

    return { message: "Templates uploaded successfully", templates: created };
  }
}
