export const AUTH_NEXT_COOKIE_NAME = "levitaeo_auth_next";
export const AUTH_NEXT_COOKIE_MAX_AGE_SECONDS = 600;

export function buildAuthCallbackUrl(origin: string): string {
  return `${origin}/auth/callback`;
}

export function setAuthNextCookie(nextPath: string): void {
  document.cookie = `${AUTH_NEXT_COOKIE_NAME}=${encodeURIComponent(nextPath)}; Path=/; Max-Age=${AUTH_NEXT_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}
