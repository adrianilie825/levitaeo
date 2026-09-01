import Image from "next/image";
import Link from "next/link";
import type { HomepageEdition } from "@/lib/home/homepage-data";

type HomeFeaturedEditionsProps = {
  editions: HomepageEdition[];
};

export default function HomeFeaturedEditions({
  editions,
}: HomeFeaturedEditionsProps) {
  const featured = editions.slice(0, 6);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-[#ECE8E2] bg-[#FAFAF8]">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:py-32 lg:px-12 lg:py-40">
        <p className="text-[11px] uppercase tracking-[0.44em] text-neutral-500">
          Editions
        </p>

        <div className="mt-16 grid gap-16 sm:grid-cols-2 lg:mt-20 lg:gap-x-12 lg:gap-y-24 xl:gap-x-16">
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
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]"
                />
              </div>

              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                  Edition {edition.edition}
                </p>
                <h3 className="mt-2 text-xl font-light tracking-[-0.01em] text-[#111111] sm:text-2xl">
                  {edition.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
