import { container } from "../../../infrastructure/container.js";
import { withErrors, jsonOk } from "../../../server/http/handle.js";

export const GET = withErrors(async () => {
  const photos = await container.listPublicPhotos.execute();
  // Mirrors the old Express response shape `{ photos: [...] }` so the
  // public gallery's existing fetch (which reads `response.photos`) keeps
  // working unchanged.
  return jsonOk({ photos });
});
