/**
 * @typedef {import("../../core/entities/role.js").Role} Role
 *
 * @typedef {object} RoleRepository
 * @property {(id: string) => Promise<Role | null>} findById
 * @property {(name: string) => Promise<Role | null>} findByName
 * @property {() => Promise<Role[]>} list
 * @property {(input: object) => Promise<Role>} create
 * @property {(id: string, patch: object) => Promise<Role>} update
 * @property {(id: string) => Promise<void>} delete
 */

export {};
