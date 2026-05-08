export class Role {
  constructor({ id, name, permissions = {}, isSystem = false, createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.permissions = permissions;
    this.isSystem = isSystem;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  hasPermission(module, action) {
    const perms = this.permissions?.[module];
    return Array.isArray(perms) && perms.includes(action);
  }
}
