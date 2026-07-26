import { NextResponse } from "next/server";
import {
  getSafeNextPath,
  linkPurchasesToAuthenticatedUser,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=auth_callback", requestUrl.origin),
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[auth-callback] Code exchange failed:", error);
      }

      return NextResponse.redirect(
        new URL("/login?error=auth_callback", requestUrl.origin),
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(
        new URL("/login?error=auth_callback", requestUrl.origin),
      );
    }

    try {
      await linkPurchasesToAuthenticatedUser(user);
    } catch (linkError) {
      if (process.env.NODE_ENV === "development") {
        console.error("[auth-callback] Purchase linking failed:", linkError);
      }
    }

    const redirectUrl = new URL(nextPath, requestUrl.origin);
    redirectUrl.searchParams.set("signed_in", "true");

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[auth-callback] Unexpected callback error:", error);
    }

    return NextResponse.redirect(
      new URL("/login?error=auth_callback", requestUrl.origin),
    );
  }
}
