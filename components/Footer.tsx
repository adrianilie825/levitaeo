import Link from "next/link";
import { siteConfig } from "@/lib/site";

const linkClassName =
  "text-[13px] text-neutral-600 transition-colors hover:text-[#111111]";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterSection = {
  title: string;
  items: FooterLink[];
};

const footerSections: FooterSection[] = [
  {
    title: "About",
    items: [
      { label: "About Levitaeo", href: "/about" },
      { label: "Our Story", href: "/about/our-story" },
      { label: "Philosophy", href: "/about/philosophy" },
      { label: "Editorial Process", href: "/about/editorial-process" },
    ],
  },
  {
    title: "Collect",
    items: [{ label: "Digital Editions", href: "/collections" }],
  },
  {
    title: "Support",
    items: [
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
    ],
  },
];

export default function Footer() {
  const instagram = siteConfig.social.instagram.trim();
  const pinterest = siteConfig.social.pinterest.trim();

  const followItems: FooterLink[] = [
    { label: "Newsletter", href: "/#journal" },
  ];

  if (instagram) {
    followItems.unshift({
      label: "Instagram",
      href: instagram,
      external: true,
    });
  }

  if (pinterest) {
    followItems.unshift({
      label: "Pinterest",
      href: pinterest,
      external: true,
    });
  }

  return (
    <footer className="w-full border-t border-[#ECE8E2] bg-[#FAFAF8]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <p className="text-[13px] font-medium tracking-[0.32em] text-[#111111]">
              LEVITAEO
            </p>
            <p className="mt-4 max-w-xs text-[13px] leading-6 tracking-[0.04em] text-neutral-600">
              {siteConfig.tagline}
            </p>
            <p className="mt-3 max-w-xs text-[13px] leading-6 text-neutral-500">
              A curated editorial destination for distinctive digital art
              editions.
            </p>
          </div>

          {footerSections.map((section) => (
            <nav
              key={section.title}
              className="lg:col-span-2"
              aria-label={section.title}
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                {section.title}
              </p>
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={linkClassName}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav className="lg:col-span-2" aria-label="Follow">
            <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
              Follow
            </p>
            <ul className="mt-5 space-y-3">
              {followItems.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      className={linkClassName}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className={linkClassName}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[#ECE8E2] pt-8 text-[12px] tracking-[0.06em] text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Levitaeo</p>
          <p>Curated digital editions for collectors and spaces.</p>
        </div>
      </div>
    </footer>
  );
}
