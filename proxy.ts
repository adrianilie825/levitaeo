import { NextResponse, type NextRequest } from "next/server";
import { getSafeNextPath } from "@/lib/auth";
import {
  isLoginPath,
  isProtectedPath,
  updateSession,
} from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!user && isProtectedPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginPath(pathname)) {
    const nextPath = getSafeNextPath(
      request.nextUrl.searchParams.get("next"),
      "/account",
    );

    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
