import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabasePublicConfigured,
} from "@/lib/supabase/env";

export function createClient() {
  if (!isSupabasePublicConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
  );
}
