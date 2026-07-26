import "server-only";

import type { User } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser, normalizeEmail } from "@/lib/auth";

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";

  return raw
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter((email) => email.length > 0);
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user?.email) {
    return false;
  }

  const adminEmails = getAdminEmails();

  if (adminEmails.length === 0) {
    return false;
  }

  return adminEmails.includes(normalizeEmail(user.email));
}

export async function requireAdmin(): Promise<User> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (!isAdminUser(user)) {
    notFound();
  }

  return user;
}

export async function requireAdminApi() {
  const user = await getAuthenticatedUser();

  if (!user || !isAdminUser(user)) {
    return null;
  }

  return user;
}
