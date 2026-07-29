"use client";

import { AdminToastProvider } from "@/components/admin/AdminToastProvider";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return <AdminToastProvider>{children}</AdminToastProvider>;
}
