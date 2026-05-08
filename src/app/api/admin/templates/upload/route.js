// Multipart upload — Next App Router parses FormData natively, so we don't
// need multer. Each `images` field is a File; we read its bytes and hand the
// buffer to the use-case (which forwards to Cloudinary).
import { container } from "../../../../../infrastructure/container.js";
import { requireSession } from "../../../../../server/http/auth-guard.js";
import { requirePermission } from "../../../../../server/http/permission-guard.js";
import { withErrors, jsonOk } from "../../../../../server/http/handle.js";
import { ValidationError } from "../../../../../core/errors/index.js";

const MAX_BYTES = 10 * 1024 * 1024;

export const POST = withErrors(async (req) => {
  const session = await requireSession("admin");
  requirePermission(session, "templates", "create");

  const form = await req.formData();
  const files = form.getAll("images");
  if (files.length === 0) throw new ValidationError("No images provided");

  const buffers = [];
  for (const f of files) {
    if (typeof f === "string") continue;
    if (!f.type?.startsWith("image/")) {
      throw new ValidationError("Only image files allowed");
    }
    if (f.size > MAX_BYTES) {
      throw new ValidationError("Image exceeds 10MB limit");
    }
    const ab = await f.arrayBuffer();
    buffers.push({
      buffer: Buffer.from(ab),
      originalName: f.name || "template",
    });
  }

  const result = await container.uploadTemplates.execute({ files: buffers });
  return jsonOk(result, { status: 201 });
});
