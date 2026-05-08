export function extractCloudinaryPublicId(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");
    const versionIndex = parts.findIndex((p) => p.startsWith("v"));
    if (versionIndex > -1 && parts.length > versionIndex + 1) {
      return parts[versionIndex + 1].split(".")[0];
    }
    return null;
  } catch (err) {
    console.error("Invalid URL:", err);
    return null;
  }
}
