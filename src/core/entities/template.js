export class Template {
  constructor({
    id,
    name,
    defaultImageUrl = null,
    imageUrl = null,
    cloudinaryPublicId = null,
    isDefault = false,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.defaultImageUrl = defaultImageUrl;
    this.imageUrl = imageUrl;
    this.cloudinaryPublicId = cloudinaryPublicId;
    this.isDefault = isDefault;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
