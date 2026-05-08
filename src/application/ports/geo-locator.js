/**
 * @typedef {object} GeoResult
 * @property {string | null} city
 * @property {string | null} state
 * @property {number | null} lat
 * @property {number | null} lon
 * @property {string | null} country
 * @property {string | null} timezone
 *
 * @typedef {object} GeoLocator
 * @property {(ip: string) => Promise<GeoResult>} lookup
 */

export {};
