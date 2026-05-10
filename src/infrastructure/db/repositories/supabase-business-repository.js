import { toBusiness } from "../supabase-mappers.js";

const TABLE = "Businesses";

/** @implements {import("../../../application/ports/business-repository.js").BusinessRepository} */
export class SupabaseBusinessRepository {
  constructor({ supabase }) {
    this.supabase = supabase;
  }

  async findById(id) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return toBusiness(data);
  }

  async findByEmail(email) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    return toBusiness(data);
  }

  async create(input) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return toBusiness(data);
  }

  async update(id, patch) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toBusiness(data);
  }

  async delete(id) {
    const { error } = await this.supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  }

  async list({
    search,
    status,
    autoApprovePromotions,
    page = 1,
    limit = 10,
  }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const buildQuery = (selector, opts) => {
      let q = this.supabase.from(TABLE).select(selector, opts);
      if (status) q = q.eq("status", status);
      if (autoApprovePromotions !== undefined) {
        q = q.eq("autoApprovePromotions", autoApprovePromotions);
      }
      if (search) {
        const safe = search.replace(/[%,]/g, "");
        q = q.or(
          `name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`,
        );
      }
      return q;
    };

    const [{ data, error }, { count, error: countErr }] = await Promise.all([
      buildQuery("*").order("createdAt", { ascending: false }).range(from, to),
      buildQuery("id", { count: "exact", head: true }),
    ]);
    if (error) throw error;
    if (countErr) throw countErr;
    return { businesses: (data ?? []).map(toBusiness), total: count ?? 0 };
  }

  async countByStatus() {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("status, autoApprovePromotions");
    if (error) throw error;
    const rows = data ?? [];
    return {
      total: rows.length,
      active: rows.filter((r) => r.status === "active").length,
      blocked: rows.filter((r) => r.status === "blocked").length,
      withAutoApprove: rows.filter((r) => r.autoApprovePromotions).length,
    };
  }
}
