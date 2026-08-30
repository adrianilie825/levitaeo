import Link from "next/link";
import { siteConfig } from "@/lib/site";

const linkClassName =
  "text-[13px] text-neutral-600 transition-colors hover:text-[#111111]";

const comingSoonClassName = "text-[13px] text-neutral-400";

type FooterLink =
  | { kind: "link"; label: string; href: string }
  | { kind: "coming-soon"; label: string };

type FooterSection = {
  title: string;
  items: FooterLink[];
};

const footerSections: FooterSection[] = [
  {
    title: "About",
    items: [
      { kind: "link", label: "About Levitaeo", href: "/about" },
      { kind: "link", label: "Our Story", href: "/about/our-story" },
      { kind: "link", label: "Philosophy", href: "/about/philosophy" },
      { kind: "link", label: "Editorial Process", href: "/about/editorial-process" },
    ],
  },
  {
    title: "Collect",
    items: [
      { kind: "link", label: "Digital Editions", href: "/collections" },
      { kind: "coming-soon", label: "Prints" },
      { kind: "coming-soon", label: "Membership" },
    ],
  },
  {
    title: "Support",
    items: [
      { kind: "link", label: "FAQ", href: "/faq" },
      { kind: "link", label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { kind: "coming-soon", label: "Privacy" },
      { kind: "coming-soon", label: "Terms" },
      { kind: "coming-soon", label: "Cookies" },
    ],
  },
];

function FooterNavItem({ item }: { item: FooterLink }) {
  if (item.kind === "link") {
    return (
      <Link href={item.href} className={linkClassName}>
        {item.label}
      </Link>
    );
  }

  return (
    <span className={comingSoonClassName}>
      {item.label}
      <span aria-hidden="true"> — coming soon</span>
    </span>
  );
}

export default function Footer() {
  const instagram = siteConfig.social.instagram.trim();
  const pinterest = siteConfig.social.pinterest.trim();

  return (
    <footer className="w-full border-t border-[#ECE8E2] bg-[#FAFAF8]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 xl:gap-10">
          <div className="sm:col-span-2 xl:col-span-2">
            <p className="text-[13px] font-medium tracking-[0.32em] text-[#111111]">
              LEVITAEO
            </p>
            <p className="mt-4 max-w-xs text-[13px] leading-6 tracking-[0.04em] text-neutral-600">
              {siteConfig.tagline}
            </p>
            <p className="mt-4 max-w-xs text-[13px] leading-6 text-neutral-500">
              A curated editorial destination for distinctive digital art.
            </p>
          </div>

          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                {section.title}
              </p>
              <ul className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <FooterNavItem item={item} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Follow">
            <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
              Follow
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                {instagram ? (
                  <a
                    href={instagram}
                    className={linkClassName}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Instagram
                  </a>
                ) : (
                  <span className={comingSoonClassName}>
                    Instagram
                    <span aria-hidden="true"> — coming soon</span>
                  </span>
                )}
              </li>
              <li>
                {pinterest ? (
                  <a
                    href={pinterest}
                    className={linkClassName}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Pinterest
                  </a>
                ) : (
                  <span className={comingSoonClassName}>
                    Pinterest
                    <span aria-hidden="true"> — coming soon</span>
                  </span>
                )}
              </li>
              <li>
                <Link href="/#journal" className={linkClassName}>
                  Newsletter
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[#ECE8E2] pt-8 text-[12px] tracking-[0.06em] text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Levitaeo</p>
          <p>Curated digital editions for collectors and spaces.</p>
        </div>
      </div>
    </footer>
  );
}
