import Image from "next/image";
import Link from "next/link";
import { HOME_EDITORIAL_CONTAINER } from "@/lib/home/homepage-layout";

const SKYLINES_DESKTOP_IMAGE = "/images/collections/skylines-cover.png";
const SKYLINES_MOBILE_IMAGE = "/images/collections/skylines-clean.png";
const SKYLINES_HREF = "/collections/skylines";

const SKYLINES_CITIES = [
  "TOKYO",
  "NEW YORK",
  "COPENHAGEN",
  "LISBON",
  "DUBAI",
];

export default function HomeSkylines() {
  return (
    <section className="bg-[#FAFAF8]">
      <div
        className={`${HOME_EDITORIAL_CONTAINER} pt-14 pb-10 md:pt-16 md:pb-12`}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#141414] sm:aspect-[16/11] md:hidden">
          <Image
            src={SKYLINES_MOBILE_IMAGE}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[38%_50%]"
            aria-hidden
          />

          <div className="absolute inset-0 flex flex-col justify-between px-5 py-10">
            <div className="max-w-[20rem]">
              <p className="text-[13px] font-normal uppercase tracking-[0.4em] text-white/90">
                Skylines
              </p>

              <h2 className="mt-5 text-[2.85rem] font-light leading-[1.04] tracking-[-0.02em] text-white">
                Cities, reduced
                <br />
                to their essential line.
              </h2>

              <p className="mt-5 text-[17px] leading-[1.65] text-white/88">
                Architectural studies of rhythm, silhouette and light.
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-[12px] uppercase leading-[1.85] tracking-[0.18em] text-white/82">
                {SKYLINES_CITIES.join(" • ")}
              </p>

              <Link
                href={SKYLINES_HREF}
                className="inline-block text-[12px] uppercase tracking-[0.22em] text-white transition-opacity hover:opacity-80"
              >
                Explore Collection →
              </Link>
            </div>
          </div>
        </div>

        <Link
          href={SKYLINES_HREF}
          aria-label="Explore Skylines collection"
          className="group hidden w-full md:block"
        >
          <Image
            src={SKYLINES_DESKTOP_IMAGE}
            alt="Skylines collection — architectural city studies"
            width={1672}
            height={941}
            sizes="(max-width: 768px) 100vw, 1400px"
            className="h-auto w-full object-contain object-center transition-opacity duration-700 group-hover:opacity-95"
          />
        </Link>
      </div>
    </section>
  );
}
