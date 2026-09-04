"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Editions" },
  { href: "/admin/products/new", label: "New Artwork" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/journal", label: "Journal" },
];

type AdminNavProps = Record<string, never>;

function isActive(href: string, currentPath: string, exact?: boolean): boolean {
  if (exact) {
    return currentPath === href;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function AdminNav(_props: AdminNavProps) {
  const currentPath = usePathname();
  return (
    <header className="border-b border-[#ECE8E2] bg-[#FAFAF8]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
            Levitaeo Admin
          </p>
          <p className="mt-2 text-sm text-neutral-600">Catalog management</p>
        </div>

        <nav
          aria-label="Admin"
          className="flex flex-wrap items-center gap-x-6 gap-y-3"
        >
          {links.map((link) => {
            const active = isActive(link.href, currentPath, link.exact);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  active
                    ? "text-[#111111]"
                    : "text-neutral-500 hover:text-[#111111]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:text-[#111111]"
          >
            Back to Site
          </Link>
        </nav>
      </div>
    </header>
  );
}
