/**
 * @typedef {import("../../core/entities/template.js").Template} Template
 *
 * @typedef {object} TemplateRepository
 * @property {(id: string) => Promise<Template | null>} findById
 * @property {() => Promise<Template[]>} list
 * @property {(input: object) => Promise<Template>} create
 * @property {(id: string) => Promise<void>} delete
 */

export {};
