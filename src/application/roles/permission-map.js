// Authoritative permission map. Mirrors hopping-deals-backend/utils/permissionMap.js.
export const PERMISSION_MAP = {
  dashboard: ["view"],
  roles: ["view", "create", "edit", "delete"],
  users: ["view", "edit", "block"],
  businesses: ["view", "edit", "approve", "auto_approve"],
  promotions: ["view", "edit", "delete", "approve", "auto_approve"],
  templates: ["view", "create", "edit", "delete"],
  categories: ["view", "create", "edit", "delete"],
};
