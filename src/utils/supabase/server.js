import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Per-request RLS-respecting client. Reads cookies for the auth context if
// Supabase Auth is in play; we don't use Supabase Auth (custom JWT) so this
// mainly forwards the publishable key for RLS-filtered reads/writes.
export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — ignored when there's no
          // session-refresh middleware. Safe for our custom-JWT setup.
        }
      },
    },
  });
};

// Service-role client. Bypasses RLS — only use server-side for trusted
// operations (registration, admin queries, Stripe webhooks). Cached as a
// singleton across requests; no per-request cookie context needed because
// it doesn't authenticate as a user.
let adminClientSingleton = null;

export const createAdminClient = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env to enable server-side admin operations.",
    );
  }
  if (!adminClientSingleton) {
    adminClientSingleton = createSupabaseClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return adminClientSingleton;
};
