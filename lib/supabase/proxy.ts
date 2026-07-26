import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabasePublicConfigured,
} from "@/lib/supabase/env";

export type ProxyAuthUser = {
  id: string;
  email: string | null;
};

export type UpdateSessionResult = {
  response: NextResponse;
  user: ProxyAuthUser | null;
};

async function resolveAuthenticatedUser(
  supabase: ReturnType<typeof createServerClient<Database>>,
): Promise<ProxyAuthUser | null> {
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (!claimsError && claimsData?.claims?.sub) {
    const emailClaim = claimsData.claims.email;

    return {
      id: String(claimsData.claims.sub),
      email: typeof emailClaim === "string" ? emailClaim : null,
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
  };
}

export async function updateSession(
  request: NextRequest,
): Promise<UpdateSessionResult> {
  let response = NextResponse.next({
    request,
  });

  if (!isSupabasePublicConfigured()) {
    return {
      response,
      user: null,
    };
  }

  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const user = await resolveAuthenticatedUser(supabase);

  return {
    response,
    user,
  };
}

export function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/library" ||
    pathname.startsWith("/library/")
  );
}

export function isLoginPath(pathname: string): boolean {
  return pathname === "/login";
}
