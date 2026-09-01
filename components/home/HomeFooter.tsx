import Link from "next/link";

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
    ],
  },
  {
    title: "Editorial",
    items: [
      { label: "Editorial Process", href: "/about/editorial-process" },
      { label: "Collections", href: "/collections" },
    ],
  },
  {
    title: "Journal",
    items: [{ label: "The Levitaeo Journal", href: "/#journal" }],
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
  {
    title: "Newsletter",
    items: [{ label: "Subscribe", href: "/#journal" }],
  },
];

export default function HomeFooter() {
  return (
    <footer
      id="journal"
      className="w-full border-t border-[#ECE8E2] bg-[#FAFAF8]"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-12 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-8">
          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                {section.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {section.items.map((item) => (
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
          ))}
        </div>

        <div className="mt-14 border-t border-[#ECE8E2] pt-8 text-[12px] tracking-[0.06em] text-neutral-500">
          <p>© {new Date().getFullYear()} Levitaeo</p>
        </div>
      </div>
    </footer>
  );
}
