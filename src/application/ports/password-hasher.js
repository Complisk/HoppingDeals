/**
 * @typedef {object} PasswordHasher
 * @property {(plaintext: string) => Promise<string>} hash
 * @property {(plaintext: string, hash: string) => Promise<boolean>} compare
 */

export {};
