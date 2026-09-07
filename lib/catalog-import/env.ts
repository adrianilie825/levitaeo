import { config as loadEnv } from "dotenv";
import { isSupabaseConfigured } from "@/lib/supabase/admin-core";

export function loadCatalogImportEnvironment(): void {
  loadEnv({ path: ".env.local", override: false });
  loadEnv({ path: ".env", override: false });
}

export function assertCatalogImportEnvironment(): void {
  loadCatalogImportEnvironment();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is required in .env.local for catalog import.",
    );
  }

  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() &&
    !process.env.SUPABASE_SECRET_KEY?.trim()
  ) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) is required in .env.local for catalog import.",
    );
  }

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase admin client could not be configured.");
  }
}

export function assertServerOnlyRuntime(): void {
  if (typeof window !== "undefined") {
    throw new Error("Catalog import must run in Node.js only.");
  }
}
