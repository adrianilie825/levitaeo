import Image from "next/image";
import Link from "next/link";
import { HOME_EDITORIAL_CONTAINER } from "@/lib/home/homepage-layout";
import type { HomepageEdition } from "@/lib/home/homepage-types";

type HomeFeaturedEditionsProps = {
  editions: HomepageEdition[];
  viewAllHref?: string;
};

export default function HomeFeaturedEditions({
  editions,
  viewAllHref = "/collections/originals/originals-series",
}: HomeFeaturedEditionsProps) {
  const featured = editions.slice(0, 6);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-[#ECE8E2] bg-[#FAFAF8]">
      <div className={`${HOME_EDITORIAL_CONTAINER} pt-6 pb-20 md:pt-8 md:pb-24 lg:pb-28`}>
        <p className="text-[11px] uppercase tracking-[0.44em] text-neutral-500">
          Editions
        </p>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-12 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:mt-14 xl:grid-cols-6 xl:gap-x-5 xl:gap-y-14">
          {featured.map((edition) => (
            <Link
              key={edition.slug}
              href={edition.href}
              className="group block"
              aria-label={`View ${edition.title}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden border border-[#E8E4DE] bg-[#F5F3EF]">
                <Image
                  src={edition.image}
                  alt={edition.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 16vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]"
                />
              </div>

              <div className="mt-4 md:mt-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                  Edition {edition.edition}
                </p>
                <h3 className="mt-2 text-base font-light tracking-[-0.01em] text-[#111111] sm:text-lg lg:text-xl">
                  {edition.title}
                </h3>
                <p className="mt-2 text-[14px] font-light tracking-[-0.01em] text-[#111111]">
                  {edition.priceLabel}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href={viewAllHref}
          className="mt-10 inline-block text-[11px] uppercase tracking-[0.2em] text-[#111111] transition-colors hover:text-neutral-600 md:mt-12"
        >
          View All Editions →
        </Link>
      </div>
    </section>
  );
}
