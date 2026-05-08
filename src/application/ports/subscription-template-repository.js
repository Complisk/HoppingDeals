/**
 * @typedef {import("../../core/entities/subscription-template.js").SubscriptionTemplate} SubscriptionTemplate
 *
 * @typedef {object} SubscriptionTemplateRepository
 * @property {(id: string) => Promise<SubscriptionTemplate | null>} findById
 * @property {() => Promise<SubscriptionTemplate[]>} list
 * @property {(input: object) => Promise<SubscriptionTemplate>} create
 * @property {(id: string, patch: object) => Promise<SubscriptionTemplate>} update
 */

export {};
