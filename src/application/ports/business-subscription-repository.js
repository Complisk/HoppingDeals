/**
 * @typedef {import("../../core/entities/business-subscription.js").BusinessSubscription} BusinessSubscription
 *
 * @typedef {object} BusinessSubscriptionRepository
 * @property {(businessId: string) => Promise<BusinessSubscription | null>} findActiveForBusiness
 * @property {(businessId: string, query: { page: number, limit: number }) => Promise<{ items: BusinessSubscription[], total: number }>} listForBusiness
 * @property {(input: object) => Promise<BusinessSubscription>} create
 * @property {(businessId: string) => Promise<void>} expireAllActiveForBusiness
 */

export {};
