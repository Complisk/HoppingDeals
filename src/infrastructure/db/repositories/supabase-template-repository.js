import { toTemplate } from "../supabase-mappers.js";

const TABLE = "Templates";

/** @implements {import("../../../application/ports/template-repository.js").TemplateRepository} */
export class SupabaseTemplateRepository {
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
    return toTemplate(data);
  }

  async list() {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*")
      .order("createdAt", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toTemplate);
  }

  async create(input) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return toTemplate(data);
  }

  async delete(id) {
    const { error } = await this.supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  }
}
