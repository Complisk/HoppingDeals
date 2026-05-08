/**
 * @typedef {object} TokenPayload
 * @property {string} id
 * @property {"user" | "business" | "admin"} type
 *
 * @typedef {object} TokenService
 * @property {(payload: TokenPayload) => Promise<string>} sign
 * @property {(token: string) => Promise<TokenPayload>} verify
 */

export {};
