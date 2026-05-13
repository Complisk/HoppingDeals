import { toPhoto } from "../supabase-mappers.js";

const TABLE = "Photos";

/** @implements {import("../../../application/ports/photo-repository.js").PhotoRepository} */
export class SupabasePhotoRepository {
  constructor({ supabase }) {
    this.supabase = supabase;
  }

  async listPublic() {
    const { data, error } = await this.supabase
      .from(TABLE)
      .select("*")
      .eq("isActive", true)
      .order("sortOrder", { ascending: true })
      .order("createdAt", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toPhoto);
  }
}
