import { v2 as cloudinary } from "cloudinary";

/** @implements {import("../../application/ports/image-uploader.js").ImageUploader} */
export class CloudinaryUploader {
  constructor({ cloudName, apiKey, apiSecret }) {
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "Cloudinary credentials missing — set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET"
      );
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    this.client = cloudinary;
  }

  upload(buffer, folder = "templates") {
    return new Promise((resolve, reject) => {
      const stream = this.client.uploader.upload_stream(
        { folder, resource_type: "image" },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error("Cloudinary upload failed"));
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      stream.end(buffer);
    });
  }

  async delete(publicId) {
    await this.client.uploader.destroy(publicId);
  }
}
