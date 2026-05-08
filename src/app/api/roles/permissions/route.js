import { withErrors, jsonOk } from "../../../../server/http/handle.js";
import { PERMISSION_MAP } from "../../../../application/roles/permission-map.js";

// Public: surfaces the permission map to the admin UI.
export const GET = withErrors(async () => jsonOk(PERMISSION_MAP));
