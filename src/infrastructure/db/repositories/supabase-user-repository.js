import { toUser } from "../supabase-mappers.js";

const TABLE = "Users";

/** @implements {import("../../../application/ports/user-repository.js").UserRepository} */
export class SupabaseUserRepository {
  constructor({ supabase }) {
    // Always pass the admin client — RLS hides Users from the publishable key,
    // and login/profile flows need the password column anyway.
    this.supabase = supabase;
  }

  async findById(id) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return toUser(data);
  }

  async findByEmail(email) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    return toUser(data);
  }

  async findByIdWithRole(id) {
    // Supabase nests the related row under the FK target table name.
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*, Roles(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return toUser({ ...data, role: data.Roles });
  }

  async findByEmailWithRole(email) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*, Roles(*)")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return toUser({ ...data, role: data.Roles });
  }

  async create(input) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return toUser(data);
  }

  async update(id, patch) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toUser(data);
  }

  async delete(id) {
    const { error } = await this.supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  }

  async list({ search, accountType, status, page = 1, limit = 10 }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const buildQuery = (selector) => {
      let q = this.supabase.from(TABLE).select(selector);
      if (accountType) q = q.eq("accountType", accountType);
      if (status) q = q.eq("status", status);
      if (search) {
        // ILIKE-style OR across fullName and email.
        const safe = search.replace(/[%,]/g, "");
        q = q.or(`fullName.ilike.%${safe}%,email.ilike.%${safe}%`);
      }
      return q;
    };

    const [{ data, error }, { count, error: countErr }] = await Promise.all([
      buildQuery("*").order("createdAt", { ascending: false }).range(from, to),
      buildQuery("id").select("id", { count: "exact", head: true }),
    ]);
    if (error) throw error;
    if (countErr) throw countErr;
    return { users: (data ?? []).map(toUser), total: count ?? 0 };
  }

  async countByStatus() {
    const { data, error } = await this.supabase.from(TABLE).select("status");
    if (error) throw error;
    const rows = data ?? [];
    return {
      total: rows.length,
      active: rows.filter((r) => r.status === "active").length,
      blocked: rows.filter((r) => r.status === "blocked").length,
      suspended: rows.filter((r) => r.status === "suspended").length,
    };
  }

  async listRecent(limit = 5) {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*, Roles(*)")
      .order("createdAt", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((row) => toUser({ ...row, role: row.Roles }));
  }
}
