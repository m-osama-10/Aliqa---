import { createClient } from "@supabase/supabase-js";

/**
 * Supabase browser client (singleton).
 * Uses ONLY the publishable/anon key — never the service role key.
 * RLS enforces all access on the server side.
 *
 * Uses createClient from @supabase/supabase-js (not @supabase/ssr)
 * because it handles localStorage auth persistence correctly in the browser.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.warn("[supabase] Missing env vars — running in offline/demo mode.");
}

export const supabase = createClient(
  url ?? "https://placeholder.supabase.co",
  key ?? "sb_publishable_placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "alieqa.auth.token",
    },
  }
);

export const SUPABASE_URL = url ?? "";
export const IS_SUPABASE_CONFIGURED = Boolean(url && key);
