"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import SearchDialog from "@/components/SearchDialog";
import { siteConfig } from "@/lib/site";

const navLinkClassName =
  "transition-colors hover:text-[#111111] text-neutral-700";

const navLinkActiveClassName = "text-[#111111]";

type NavbarProps = {
  isAuthenticated?: boolean;
};

function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/collections") {
    return pathname === "/collections" || pathname.startsWith("/collections/");
  }

  if (href === "/about") {
    return pathname === "/about" || pathname.startsWith("/about/");
  }

  if (href === "/faq#membership") {
    return pathname === "/faq";
  }

  if (href === "/journal") {
    return pathname === "/journal" || pathname.startsWith("/journal/");
  }

  return pathname === href;
}

function PrimaryNavLink({
  href,
  children,
  pathname,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = isNavLinkActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`${navLinkClassName} ${isActive ? navLinkActiveClassName : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export default function Navbar({ isAuthenticated = false }: NavbarProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  const closeMobileMenu = useCallback(() => {
    if (mobileMenuRef.current) {
      mobileMenuRef.current.open = false;
    }
  }, []);

  const openSearch = useCallback(() => {
    closeMobileMenu();
    setSearchOpen(true);
  }, [closeMobileMenu]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSearch]);

  const primaryLinks = (
    <>
      <PrimaryNavLink href="/collections" pathname={pathname} onNavigate={closeMobileMenu}>
        Collections
      </PrimaryNavLink>
      <PrimaryNavLink href="/journal" pathname={pathname} onNavigate={closeMobileMenu}>
        Journal
      </PrimaryNavLink>
      <PrimaryNavLink href="/faq#membership" pathname={pathname} onNavigate={closeMobileMenu}>
        Membership
      </PrimaryNavLink>
      <PrimaryNavLink href="/about" pathname={pathname} onNavigate={closeMobileMenu}>
        About
      </PrimaryNavLink>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 mb-7 border-b border-[#ECE8E2] bg-[#FAFAF8]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[#FAFAF8]/75 md:mb-0">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center gap-4 px-6 py-3 lg:gap-8 lg:px-10">
          <Link
            href="/"
            className="group shrink-0 transition-opacity hover:opacity-80"
          >
            <span className="block text-[15px] font-medium tracking-[0.32em] text-[#111111]">
              LEVITAEO
            </span>
            <span className="mt-1 block text-[9px] font-normal tracking-[0.2em] text-neutral-400">
              {siteConfig.tagline}
            </span>
          </Link>

          <nav
            className="hidden flex-1 items-center justify-center gap-10 text-[13px] font-normal tracking-[0.12em] lg:flex"
            aria-label="Primary"
          >
            {primaryLinks}
          </nav>

          <div className="hidden items-center gap-8 text-[13px] tracking-[0.08em] text-neutral-700 lg:flex">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Open search"
              className="inline-flex items-center gap-2 transition-colors hover:text-[#111111]"
            >
              <span>Search</span>
              <span className="rounded border border-[#ECE8E2] px-1.5 py-0.5 text-[10px] tracking-[0.08em] text-neutral-400">
                ⌘K
              </span>
            </button>
            {isAuthenticated ? (
              <>
                <Link href="/library" className={navLinkClassName}>
                  My Library
                </Link>
                <Link href="/account" className={navLinkClassName}>
                  Account
                </Link>
              </>
            ) : (
              <Link href="/login" className={navLinkClassName}>
                Sign In
              </Link>
            )}
          </div>

          <div className="ml-auto flex items-center gap-5 lg:hidden">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Open search"
              className="text-[13px] tracking-[0.08em] text-neutral-700 transition-colors hover:text-[#111111]"
            >
              Search
            </button>

            <details ref={mobileMenuRef} className="group relative">
              <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-[#ECE8E2] bg-white/60 transition hover:border-neutral-400 [&::-webkit-details-marker]:hidden">
                <span className="sr-only">Open menu</span>
                <svg
                  aria-hidden
                  className="h-4 w-4 text-[#111111]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 7h16M4 12h16M4 17h16"
                  />
                </svg>
              </summary>

              <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(100vw-3rem,280px)] rounded-2xl border border-[#ECE8E2] bg-[#FAFAF8] p-6 shadow-lg shadow-black/5">
                <nav
                  className="flex flex-col gap-5 text-sm tracking-[0.12em] text-neutral-700"
                  aria-label="Mobile"
                >
                  {primaryLinks}
                  <div className="my-1 h-px bg-[#ECE8E2]" />
                  <button
                    type="button"
                    onClick={openSearch}
                    className="text-left transition-colors hover:text-[#111111]"
                  >
                    Search
                  </button>
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/library"
                        className={navLinkClassName}
                        onClick={closeMobileMenu}
                      >
                        My Library
                      </Link>
                      <Link
                        href="/account"
                        className={navLinkClassName}
                        onClick={closeMobileMenu}
                      >
                        Account
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className={navLinkClassName}
                      onClick={closeMobileMenu}
                    >
                      Sign In
                    </Link>
                  )}
                </nav>
              </div>
            </details>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </>
  );
}
