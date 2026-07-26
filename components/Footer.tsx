import Link from "next/link";

const exploreLinks = [
  { label: "Collections", href: "/collections" },
  { label: "Originals", href: "/collections/originals" },
];

const linkClassName =
  "transition-colors hover:text-[#111111] text-neutral-600";

const unavailableClassName = "text-[13px] text-neutral-400";

export default function Footer() {
  return (
    <footer className="border-t border-[#ECE8E2] bg-[#FAFAF8]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-14">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-10">
          <div>
            <p className="text-[13px] font-medium tracking-[0.32em] text-[#111111]">
              LEVITAEO
            </p>
            <p className="mt-4 max-w-xs text-[13px] leading-6 tracking-[0.04em] text-neutral-600">
              Digital Art Worth Collecting
            </p>
          </div>

          <nav aria-label="Explore">
            <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
              Explore
            </p>
            <ul className="mt-4 space-y-3">
              {exploreLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`text-[13px] ${linkClassName}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <span className={unavailableClassName}>Skylines — coming soon</span>
              </li>
              <li>
                <span className={unavailableClassName}>Prints — coming soon</span>
              </li>
            </ul>
          </nav>

          <nav aria-label="About">
            <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
              About
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <span className={unavailableClassName}>Our Story — coming soon</span>
              </li>
              <li>
                <span className={unavailableClassName}>Journal — coming soon</span>
              </li>
              <li>
                <span className={unavailableClassName}>Membership — coming soon</span>
              </li>
              <li>
                <span className={unavailableClassName}>Contact — coming soon</span>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
              Legal
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <span className={unavailableClassName}>Terms — coming soon</span>
              </li>
              <li>
                <span className={unavailableClassName}>Privacy — coming soon</span>
              </li>
              <li>
                <span className={unavailableClassName}>Licensing — coming soon</span>
              </li>
              <li>
                <span className={unavailableClassName}>Refund Policy — coming soon</span>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[#ECE8E2] pt-6 text-[12px] tracking-[0.06em] text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Levitaeo</p>
          <p>Social channels coming soon</p>
        </div>
      </div>
    </footer>
  );
}
