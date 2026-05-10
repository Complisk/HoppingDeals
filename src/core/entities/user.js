export class User {
  constructor({
    id,
    fullName,
    email,
    password,
    wishlist = [],
    roleId = null,
    accountType = "user",
    isSuperAdmin = false,
    avatarUrl = null,
    status = "active",
    timezone = "UTC",
    resetPasswordToken = null,
    resetPasswordExpires = null,
    createdAt,
    updatedAt,
    role = null,
  }) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.wishlist = wishlist;
    this.roleId = roleId;
    this.accountType = accountType;
    this.isSuperAdmin = isSuperAdmin;
    this.avatarUrl = avatarUrl;
    this.status = status;
    this.timezone = timezone;
    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpires = resetPasswordExpires;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.role = role;
  }

  isBlockedOrSuspended() {
    return this.status === "blocked" || this.status === "suspended";
  }

  hasPermission(module, action) {
    if (this.isSuperAdmin) return true;
    const perms = this.role?.permissions;
    if (!perms || !Array.isArray(perms[module])) return false;
    return perms[module].includes(action);
  }

  toPublicJSON() {
    const { password: _password, resetPasswordToken: _t, resetPasswordExpires: _e, ...rest } = this;
    return rest;
  }
}
