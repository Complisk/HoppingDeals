import { container } from "../../../../infrastructure/container.js";
import { withErrors, jsonOk } from "../../../../server/http/handle.js";

export const GET = withErrors(async () => {
  const templates = await container.listTemplates.execute();
  return jsonOk(templates);
});
