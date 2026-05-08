/**
 * @typedef {object} UploadedImage
 * @property {string} url
 * @property {string} publicId
 *
 * @typedef {object} ImageUploader
 * @property {(buffer: Buffer, folder?: string) => Promise<UploadedImage>} upload
 * @property {(publicId: string) => Promise<void>} delete
 */

export {};
