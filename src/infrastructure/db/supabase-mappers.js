// Mappers for Supabase rows -> domain entities.
//
// The Supabase tables follow Sequelize's quoted-camelCase identifier convention
// (e.g. "Businesses", "PromotionLocations"), and PromotionLocations stores
// city/state info one-row-per-location (snake_case columns: city_name, state_code).
// We rebuild the in-memory `cities[]` / `states[]` arrays the Promotion entity
// expects from those rows.

import {
  User,
  Business,
  Role,
  Template,
  Promotion,
  SubscriptionTemplate,
  BusinessSubscription,
  SubscriptionHistory,
  Photo,
} from "../../core/entities/index.js";

const num = (v) => (v == null ? v : Number(v));

const parseCategories = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const toUser = (row) => {
  if (!row) return null;
  return new User({
    ...row,
    role: row.role ? toRole(row.role) : row.Role ? toRole(row.Role) : null,
  });
};

export const toRole = (row) => row && new Role(row);

export const toBusiness = (row) => {
  if (!row) return null;
  return new Business({
    ...row,
    categories: parseCategories(row.categories),
  });
};

export const toTemplate = (row) => row && new Template(row);

// Rebuild cities[]/states[] from joined PromotionLocations rows.
//   { type: 'city', city_name, state_code, country_code, timezone }  -> cities
//   { type: 'state', state_code, state_name, country_code }          -> states
function locationsToCitiesStates(locations) {
  if (!Array.isArray(locations)) return { cities: [], states: [] };
  const cities = [];
  const states = [];
  for (const loc of locations) {
    if (loc.type === "city" || loc.city_name) {
      cities.push({
        name: loc.city_name,
        state_code: loc.state_code,
        state_name: loc.state_name,
        country_code: loc.country_code,
        county_name: loc.county_name,
        timezone: loc.timezone,
      });
    } else if (loc.type === "state" || (loc.state_code && !loc.city_name)) {
      states.push({
        state_code: loc.state_code,
        state_name: loc.state_name,
        country_code: loc.country_code,
        timezone: loc.timezone,
      });
    }
  }
  return { cities, states };
}

export const toPromotion = (row) => {
  if (!row) return null;
  // Supabase nests the join under the FK relationship name — the table name itself.
  const locations = row.PromotionLocations ?? [];
  const { cities, states } = locationsToCitiesStates(locations);

  // Joins for related entities — Supabase exposes them under the table name.
  const business = row.Businesses ?? row.business ?? null;
  const template = row.Templates ?? row.template ?? null;

  return new Promotion({
    ...row,
    cities,
    states,
    categories: parseCategories(row.categories),
    price: num(row.price),
    business: business ? toBusiness(business) : null,
    template: template ? toTemplate(template) : null,
  });
};

export const toSubscriptionTemplate = (row) =>
  row && new SubscriptionTemplate({ ...row, price: num(row.price) });

export const toBusinessSubscription = (row) => {
  if (!row) return null;
  return new BusinessSubscription({
    ...row,
    template: row.SubscriptionTemplates
      ? toSubscriptionTemplate(row.SubscriptionTemplates)
      : row.template
        ? toSubscriptionTemplate(row.template)
        : null,
  });
};

export const toSubscriptionHistory = (row) =>
  row && new SubscriptionHistory(row);

export const toPhoto = (row) => row && new Photo(row);

// Helpers for outgoing payloads — strip relationship objects + auto-managed
// timestamps before INSERT/UPDATE so Supabase doesn't choke.
export function stripRelationsAndTimestamps(obj) {
  if (!obj) return obj;
  const {
    business: _b,
    template: _t,
    role: _r,
    Businesses: _B,
    Templates: _T,
    Roles: _R,
    PromotionLocations: _PL,
    SubscriptionTemplates: _ST,
    createdAt: _c,
    updatedAt: _u,
    ...rest
  } = obj;
  return rest;
}

// Locations the Promotion entity carries -> rows for the PromotionLocations table.
export function citiesStatesToLocationRows(promotionId, cities = [], states = []) {
  const rows = [];
  for (const c of cities) {
    rows.push({
      promotionId,
      type: "city",
      country_code: c.country_code ?? null,
      state_code: c.state_code ?? null,
      state_name: c.state_name ?? null,
      city_name: c.name ?? c.city_name ?? null,
      county_name: c.county_name ?? null,
      timezone: c.timezone ?? null,
    });
  }
  for (const s of states) {
    rows.push({
      promotionId,
      type: "state",
      country_code: s.country_code ?? null,
      state_code: s.state_code ?? null,
      state_name: s.state_name ?? null,
      city_name: null,
      county_name: null,
      timezone: s.timezone ?? null,
    });
  }
  return rows;
}
