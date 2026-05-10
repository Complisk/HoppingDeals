import { toRole } from "../supabase-mappers.js";

const TABLE = "Roles";

/** @implements {import("../../../application/ports/role-repository.js").RoleRepository} */
export class SupabaseRoleRepository {
  constructor({ supabase }) {
    this.supabase = supabase;
  }

  async findById(id) {
    const { data, error } = await this.supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return toRole(data);
  }

  async findByName(name) {
    const { data, error } = await this.supabase.from(TABLE).select("*").eq("name", name).maybeSingle();
    if (error) throw error;
    return toRole(data);
  }

  async list() {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*")
      .order("createdAt", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toRole);
  }

  async create(input) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return toRole(data);
  }

  async update(id, patch) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toRole(data);
  }

  async delete(id) {
    const { error } = await this.supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  }
}
