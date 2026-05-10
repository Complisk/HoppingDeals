import { toSubscriptionTemplate } from "../supabase-mappers.js";

const TABLE = "SubscriptionTemplates";

/** @implements {import("../../../application/ports/subscription-template-repository.js").SubscriptionTemplateRepository} */
export class SupabaseSubscriptionTemplateRepository {
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
    return toSubscriptionTemplate(data);
  }

  async list() {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*")
      .order("price", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toSubscriptionTemplate);
  }

  async create(input) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return toSubscriptionTemplate(data);
  }

  async update(id, patch) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toSubscriptionTemplate(data);
  }
}
