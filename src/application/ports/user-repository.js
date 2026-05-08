/**
 * @typedef {import("../../core/entities/user.js").User} User
 *
 * @typedef {object} UserRepository
 * @property {(id: string) => Promise<User | null>} findById
 * @property {(email: string) => Promise<User | null>} findByEmail
 * @property {(id: string) => Promise<User | null>} findByIdWithRole
 * @property {(email: string) => Promise<User | null>} findByEmailWithRole
 * @property {(input: object) => Promise<User>} create
 * @property {(id: string, patch: object) => Promise<User>} update
 * @property {(id: string) => Promise<void>} delete
 * @property {(query: object) => Promise<{ users: User[], total: number }>} list
 * @property {() => Promise<{ total: number, active: number, blocked: number, suspended: number }>} countByStatus
 * @property {(limit?: number) => Promise<User[]>} listRecent
 */

export {}; // marks file as a module
