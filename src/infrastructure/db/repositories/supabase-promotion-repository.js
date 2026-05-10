import {
  toPromotion,
  stripRelationsAndTimestamps,
  citiesStatesToLocationRows,
} from "../supabase-mappers.js";

const TABLE = "Promotions";
const LOC_TABLE = "PromotionLocations";

const SELECT_WITH_LOCATIONS = `*, PromotionLocations(*)`;
const SELECT_WITH_LOCATIONS_AND_BUSINESS = `*, PromotionLocations(*), Businesses(*)`;
const SELECT_WITH_LOCATIONS_AND_TEMPLATE = `*, PromotionLocations(*), Templates(*)`;
const SELECT_WITH_LOCATIONS_BUSINESS_TEMPLATE = `*, PromotionLocations(*), Businesses(*), Templates(*)`;

// Production stores category slugs in two flavours:
//   "coffee-&-tea"          (legacy, with literal "&")
//   "coffee-tea"            (newer, hyphen-only)
// Public URLs and menu links use the hyphen-only form. Expand whatever
// slug the caller hands us into both spellings so a click on
// /category/coffee-tea still picks up rows tagged "coffee-&-tea", and
// /category/coffee-%26-tea still picks up rows tagged "coffee-tea".
function expandCategorySlug(slug) {
  if (!slug) return [];
  const lower = String(slug).toLowerCase();
  const variants = new Set([lower]);

  // hyphen-only -> add a "&" variant for known multi-word categories
  // (insert "&" between every adjacent pair of hyphens).
  if (!lower.includes("&")) {
    const parts = lower.split("-").filter(Boolean);
    if (parts.length === 2) {
      variants.add(`${parts[0]}-&-${parts[1]}`);
    } else if (parts.length === 3) {
      // e.g. "event-planning-services" -> "event-planning-&-services"
      variants.add(`${parts[0]}-${parts[1]}-&-${parts[2]}`);
    }
  } else {
    // strip "&" to also match the hyphen-only form
    variants.add(lower.replace(/-?&-?/g, "-").replace(/--+/g, "-"));
  }

  return Array.from(variants);
}

/** @implements {import("../../../application/ports/promotion-repository.js").PromotionRepository} */
export class SupabasePromotionRepository {
  constructor({ supabase }) {
    this.supabase = supabase;
  }

  async findById(id) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_LOCATIONS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return toPromotion(data);
  }

  async findByIdWithRelations(id, { withBusiness = false } = {}) {
    const selector = withBusiness
      ? SELECT_WITH_LOCATIONS_BUSINESS_TEMPLATE
      : SELECT_WITH_LOCATIONS_AND_TEMPLATE;
    const { data, error } = await this.supabase
      .from(TABLE)
      .select(selector)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return toPromotion(data);
  }

  async findByIdForBusiness(id, businessId) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select(SELECT_WITH_LOCATIONS)
      .eq("id", id)
      .eq("businessId", businessId)
      .maybeSingle();
    if (error) throw error;
    return toPromotion(data);
  }

  async create(input) {
    // Promotion entity carries cities[]/states[] in memory; the DB stores them
    // as rows in PromotionLocations. Split, insert the parent, then the children.
    const { cities = [], states = [], ...rest } = input;
    const payload = stripRelationsAndTimestamps(rest);

    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    const locRows = citiesStatesToLocationRows(data.id, cities, states);
    if (locRows.length > 0) {
      const { error: locErr } = await this.supabase
        .from(LOC_TABLE)
        .insert(locRows);
      if (locErr) throw locErr;
    }

    return this.findById(data.id);
  }

  async save(promotion) {
    const {
      id,
      cities = [],
      states = [],
      business: _b,
      template: _t,
      createdAt: _c,
      updatedAt: _u,
      ...rest
    } = promotion;
    const payload = stripRelationsAndTimestamps(rest);

    const { error } = await this.supabase
      .from(TABLE)
      .update(payload)
      .eq("id", id);
    if (error) throw error;

    // Replace locations: delete existing, insert fresh.
    const { error: delErr } = await this.supabase
      .from(LOC_TABLE)
      .delete()
      .eq("promotionId", id);
    if (delErr) throw delErr;

    const locRows = citiesStatesToLocationRows(id, cities, states);
    if (locRows.length > 0) {
      const { error: insErr } = await this.supabase
        .from(LOC_TABLE)
        .insert(locRows);
      if (insErr) throw insErr;
    }

    return this.findById(id);
  }

  async delete(id) {
    // PromotionLocations is FK'd with cascade-on-delete in the schema, but
    // do it explicitly first to be safe.
    await this.supabase.from(LOC_TABLE).delete().eq("promotionId", id);
    const { error } = await this.supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  }

  async list({
    ids,
    status,
    businessSearch,
    page = 1,
    limit = 10,
    includeBusiness = false,
  }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Pre-resolve businessSearch to a set of businessIds — Supabase nested
    // filtering is awkward across joins, so we do this in two steps.
    let businessIdFilter = null;
    if (businessSearch) {
      const safe = businessSearch.replace(/[%,]/g, "");
      const { data: bizMatches, error: bErr } = await this.supabase
        .from("Businesses")
        .select("id")
        .or(`name.ilike.%${safe}%,email.ilike.%${safe}%`);
      if (bErr) throw bErr;
      businessIdFilter = (bizMatches ?? []).map((b) => b.id);
      if (businessIdFilter.length === 0) {
        return { promotions: [], total: 0 };
      }
    }

    const buildQuery = (selector, opts) => {
      let q = this.supabase.from(TABLE).select(selector, opts);
      if (ids?.length) q = q.in("id", ids);
      if (status) q = q.eq("status", status);
      if (businessIdFilter) q = q.in("businessId", businessIdFilter);
      return q;
    };

    const dataSelector = includeBusiness
      ? SELECT_WITH_LOCATIONS_AND_BUSINESS
      : SELECT_WITH_LOCATIONS;

    const [{ data, error }, { count, error: countErr }] = await Promise.all([
      buildQuery(dataSelector)
        .order("createdAt", { ascending: false })
        .range(from, to),
      buildQuery("id", { count: "exact", head: true }),
    ]);
    if (error) throw error;
    if (countErr) throw countErr;
    return { promotions: (data ?? []).map(toPromotion), total: count ?? 0 };
  }

  // Public feed: status=active, optional category filter, optional location
  // filter via a sub-query against PromotionLocations.
  //   `category`   single slug (e.g. "restaurants")
  //   `categories` list of slugs OR'd together (e.g. ["food", "coffee-tea"]).
  // CategoryStreet on the homepage produces multi-category URLs such as
  // /category/food,coffee-&-tea,restaurants — those land here as a list.
  async listPublic({ city, state, timezone, category, categories }) {
    // Pre-resolve promotionIds that match city/state/timezone (if any).
    let promotionIdFilter = null;
    if (city || state || timezone) {
      let locQuery = this.supabase.from(LOC_TABLE).select("promotionId");
      if (city) locQuery = locQuery.eq("city_name", city);
      if (state) locQuery = locQuery.eq("state_code", state);
      if (timezone) locQuery = locQuery.eq("timezone", timezone);
      const { data: locs, error: locErr } = await locQuery;
      if (locErr) throw locErr;
      promotionIdFilter = [...new Set((locs ?? []).map((l) => l.promotionId))];
      if (promotionIdFilter.length === 0) return [];
    }

    let q = this.supabase
      .from(TABLE)
      .select(
        `*, PromotionLocations(*), Businesses(name, categories, businessAddress)`,
      )
      .eq("status", "active");

    // Build the union of slug variants across either the single category
    // or the categories[] list. Production seeds slugs in two flavours
    // ("coffee-&-tea" vs "coffee-tea"); expandCategorySlug emits both so
    // the URL-form and the DB-form both match.
    const slugList = Array.isArray(categories) && categories.length > 0
      ? categories
      : category
        ? [category]
        : [];
    if (slugList.length > 0) {
      const allVariants = Array.from(
        new Set(slugList.flatMap((s) => expandCategorySlug(s))),
      );
      q = q.overlaps("categories", allVariants);
    }

    if (promotionIdFilter) q = q.in("id", promotionIdFilter);

    const { data, error } = await q.order("createdAt", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toPromotion);
  }

  async listForBusiness(businessId, { search, status }) {
    let q = this.supabase
      .from(TABLE)
      .select(SELECT_WITH_LOCATIONS)
      .eq("businessId", businessId);
    if (status) q = q.eq("status", status);
    if (search) {
      // categories is an array column — match if any element ilike %search%.
      // Supabase doesn't directly support ILIKE on array elements, so fall
      // back to overlap on a sanitized value.
      const safe = search.replace(/[%,]/g, "");
      q = q.contains("categories", [safe]);
    }
    const { data, error } = await q.order("createdAt", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toPromotion);
  }

  async businessStats(businessId) {
    const now = new Date();
    const last7 = new Date(now.getTime() - 7 * 86_400_000).toISOString();
    const last30 = new Date(now.getTime() - 30 * 86_400_000).toISOString();

    const baseFilter = (q) => q.eq("businessId", businessId);

    const [totalRes, activeRes, weeklyRes, monthlyRes] = await Promise.all([
      baseFilter(this.supabase.from(TABLE).select("id", { count: "exact", head: true })),
      baseFilter(this.supabase.from(TABLE).select("id", { count: "exact", head: true })).eq(
        "status",
        "active",
      ),
      baseFilter(this.supabase.from(TABLE).select("id", { count: "exact", head: true })).gte(
        "createdAt",
        last7,
      ),
      baseFilter(this.supabase.from(TABLE).select("id", { count: "exact", head: true })).gte(
        "createdAt",
        last30,
      ),
    ]);

    if (totalRes.error) throw totalRes.error;
    if (activeRes.error) throw activeRes.error;
    if (weeklyRes.error) throw weeklyRes.error;
    if (monthlyRes.error) throw monthlyRes.error;

    return {
      total: totalRes.count ?? 0,
      active: activeRes.count ?? 0,
      weekly: weeklyRes.count ?? 0,
      monthly: monthlyRes.count ?? 0,
    };
  }

  async adminStats() {
    const countsByStatus = async (status) => {
      let q = this.supabase.from(TABLE).select("id", { count: "exact", head: true });
      if (status) q = q.eq("status", status);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    };

    // Aggregations: Supabase JS doesn't expose SUM directly; pull only the needed columns.
    const sumColumn = async (column, statusFilter) => {
      let q = this.supabase.from(TABLE).select(column);
      if (statusFilter) q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).reduce((acc, r) => acc + Number(r[column] ?? 0), 0);
    };

    const [total, active, pending, inactive, totalRevenue, totalViews, totalClicks] =
      await Promise.all([
        countsByStatus(),
        countsByStatus("active"),
        countsByStatus("pending"),
        countsByStatus("inactive"),
        sumColumn("price", "active"),
        sumColumn("views"),
        sumColumn("clicks"),
      ]);

    return {
      total,
      active,
      pending,
      inactive,
      totalRevenue,
      totalViews,
      totalClicks,
    };
  }

  async listRecentForAdmin(limit = 5) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select(
        `id, businessId, status, price, createdAt, views, clicks, Businesses(id, name)`,
      )
      .order("createdAt", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      businessId: r.businessId,
      status: r.status,
      price: Number(r.price ?? 0),
      createdAt: r.createdAt,
      views: r.views,
      clicks: r.clicks,
      business: r.Businesses ? { id: r.Businesses.id, name: r.Businesses.name } : null,
    }));
  }

  async deactivateAllOthersForBusiness(businessId, exceptId) {
    const { error } = await this.supabase
      .from(TABLE)
      .update({ status: "inactive" })
      .eq("businessId", businessId)
      .eq("status", "active")
      .neq("id", exceptId);
    if (error) throw error;
  }

  async incrementViews(id) {
    // Supabase JS has no atomic increment; fetch + update is safe enough here
    // (views is a non-critical analytics counter).
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("views")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return;
    const { error: updErr } = await this.supabase
      .from(TABLE)
      .update({ views: (data.views ?? 0) + 1 })
      .eq("id", id);
    if (updErr) throw updErr;
  }

  async incrementClicks(id) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("clicks")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return;
    const { error: updErr } = await this.supabase
      .from(TABLE)
      .update({ clicks: (data.clicks ?? 0) + 1 })
      .eq("id", id);
    if (updErr) throw updErr;
  }
}
