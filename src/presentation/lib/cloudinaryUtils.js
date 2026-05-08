// Direct browser→Cloudinary upload using an unsigned upload preset.
const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dgdfenqsv";
const CLOUDINARY_UPLOAD_PRESET = "file upload";

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );
  if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);
  const data = await response.json();
  return data.secure_url;
};
