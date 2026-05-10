import { toBusinessSubscription } from "../supabase-mappers.js";

const TABLE = "BusinessSubscriptions";

/** @implements {import("../../../application/ports/business-subscription-repository.js").BusinessSubscriptionRepository} */
export class SupabaseBusinessSubscriptionRepository {
  constructor({ supabase }) {
    this.supabase = supabase;
  }

  async findActiveForBusiness(businessId) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*, SubscriptionTemplates(name, durationMonths, price)")
      .eq("businessId", businessId)
      .eq("status", "active")
      .order("endDate", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return toBusinessSubscription(data);
  }

  async listForBusiness(businessId, { page = 1, limit = 10 }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const [{ data, error }, { count, error: countErr }] = await Promise.all([
      this.supabase
        .from(TABLE)
        .select("*")
        .eq("businessId", businessId)
        .order("createdAt", { ascending: false })
        .range(from, to),
      this.supabase
        .from(TABLE)
        .select("id", { count: "exact", head: true })
        .eq("businessId", businessId),
    ]);
    if (error) throw error;
    if (countErr) throw countErr;
    return {
      items: (data ?? []).map(toBusinessSubscription),
      total: count ?? 0,
    };
  }

  async create(input) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return toBusinessSubscription(data);
  }

  async expireAllActiveForBusiness(businessId) {
    const { error } = await this.supabase
      .from(TABLE)
      .update({ status: "expired" })
      .eq("businessId", businessId)
      .eq("status", "active");
    if (error) throw error;
  }
}
