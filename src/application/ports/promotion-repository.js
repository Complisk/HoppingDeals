/**
 * @typedef {import("../../core/entities/promotion.js").Promotion} Promotion
 *
 * @typedef {object} PromotionRepository
 * @property {(id: string) => Promise<Promotion | null>} findById
 * @property {(id: string, opts?: { withBusiness?: boolean }) => Promise<Promotion | null>} findByIdWithRelations
 * @property {(id: string, businessId: string) => Promise<Promotion | null>} findByIdForBusiness
 * @property {(input: object) => Promise<Promotion>} create
 * @property {(promotion: Promotion) => Promise<Promotion>} save
 * @property {(id: string) => Promise<void>} delete
 * @property {(query: object) => Promise<{ promotions: Promotion[], total: number }>} list
 * @property {(query: object) => Promise<Promotion[]>} listPublic
 * @property {(businessId: string, query: object) => Promise<Promotion[]>} listForBusiness
 * @property {(businessId: string) => Promise<{ total: number, active: number, weekly: number, monthly: number }>} businessStats
 * @property {() => Promise<{ total: number, active: number, pending: number, inactive: number, totalRevenue: number, totalViews: number, totalClicks: number }>} adminStats
 * @property {(limit?: number) => Promise<Promotion[]>} listRecentForAdmin
 * @property {(businessId: string, exceptId: string) => Promise<void>} deactivateAllOthersForBusiness
 * @property {(id: string) => Promise<void>} incrementViews
 * @property {(id: string) => Promise<void>} incrementClicks
 */

export {};
