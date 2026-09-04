import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getSafeNextPath,
  linkPurchasesToAuthenticatedUser,
} from "@/lib/auth";
import {
  AUTH_NEXT_COOKIE_NAME,
  buildAuthCallbackUrl,
} from "@/lib/auth/next-path";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function resolveNextPath(
  nextFromQuery: string | null,
  nextFromCookie: string | undefined,
): string {
  return getSafeNextPath(nextFromQuery ?? nextFromCookie);
}

function clearAuthNextCookie(response: NextResponse): void {
  response.cookies.set(AUTH_NEXT_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextFromQuery = requestUrl.searchParams.get("next");
  const cookieStore = await cookies();
  const nextFromCookie = cookieStore.get(AUTH_NEXT_COOKIE_NAME)?.value;
  const nextPath = resolveNextPath(nextFromQuery, nextFromCookie);
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    console.log("[auth-callback] incoming request:", {
      callbackOrigin: requestUrl.origin,
      callbackPath: requestUrl.pathname,
      hasCode: Boolean(code),
      nextFromQuery,
      nextFromCookie,
      resolvedNextPath: nextPath,
    });
  }

  if (!code) {
    const loginUrl = new URL("/login?error=auth_callback", requestUrl.origin);

    if (isDevelopment) {
      console.log("[auth-callback] missing code, redirecting to:", loginUrl.toString());
    }

    const response = NextResponse.redirect(loginUrl);
    clearAuthNextCookie(response);
    return response;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      if (isDevelopment) {
        console.error("[auth-callback] Code exchange failed:", error);
      }

      const response = NextResponse.redirect(
        new URL("/login?error=auth_callback", requestUrl.origin),
      );
      clearAuthNextCookie(response);
      return response;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const response = NextResponse.redirect(
        new URL("/login?error=auth_callback", requestUrl.origin),
      );
      clearAuthNextCookie(response);
      return response;
    }

    try {
      await linkPurchasesToAuthenticatedUser(user);
    } catch (linkError) {
      if (isDevelopment) {
        console.error("[auth-callback] Purchase linking failed:", linkError);
      }
    }

    const redirectUrl = new URL(nextPath, requestUrl.origin);
    redirectUrl.searchParams.set("signed_in", "true");

    if (isDevelopment) {
      console.log("[auth-callback] success redirect:", {
        callbackOrigin: requestUrl.origin,
        receivedNextQuery: nextFromQuery,
        receivedNextCookie: nextFromCookie,
        finalRedirectDestination: redirectUrl.toString(),
        allowedCallbackUrl: buildAuthCallbackUrl(requestUrl.origin),
      });
    }

    const response = NextResponse.redirect(redirectUrl);
    clearAuthNextCookie(response);
    return response;
  } catch (error) {
    if (isDevelopment) {
      console.error("[auth-callback] Unexpected callback error:", error);
    }

    const response = NextResponse.redirect(
      new URL("/login?error=auth_callback", requestUrl.origin),
    );
    clearAuthNextCookie(response);
    return response;
  }
}
