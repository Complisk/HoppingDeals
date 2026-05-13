export class Photo {
  constructor({
    id,
    title,
    description = null,
    imageUrl,
    cloudinaryPublicId = null,
    altText = null,
    isActive = true,
    sortOrder = 0,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.imageUrl = imageUrl;
    this.cloudinaryPublicId = cloudinaryPublicId;
    this.altText = altText;
    this.isActive = isActive;
    this.sortOrder = sortOrder;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
