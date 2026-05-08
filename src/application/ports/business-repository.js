/**
 * @typedef {import("../../core/entities/business.js").Business} Business
 *
 * @typedef {object} BusinessRepository
 * @property {(id: string) => Promise<Business | null>} findById
 * @property {(email: string) => Promise<Business | null>} findByEmail
 * @property {(input: object) => Promise<Business>} create
 * @property {(id: string, patch: object) => Promise<Business>} update
 * @property {(id: string) => Promise<void>} delete
 * @property {(query: object) => Promise<{ businesses: Business[], total: number }>} list
 * @property {() => Promise<{ total: number, active: number, blocked: number, withAutoApprove: number }>} countByStatus
 */

export {};
