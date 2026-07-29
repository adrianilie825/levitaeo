import type { Metadata } from "next";
import AdminNav from "@/components/admin/AdminNav";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Levitaeo Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <AdminShell>
      <div className="min-h-full bg-[#FAFAF8] text-[#111111]">
        <AdminNav />
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
          {children}
        </div>
      </div>
    </AdminShell>
  );
}
