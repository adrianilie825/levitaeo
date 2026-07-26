import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabasePublicConfigured,
} from "@/lib/supabase/env";

export function createCatalogClient() {
  if (!isSupabasePublicConfigured()) {
    throw new Error("Supabase public configuration is missing.");
  }

  return createClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
