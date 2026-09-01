import Image from "next/image";
import Link from "next/link";
import { HOME_EDITORIAL_CONTAINER } from "@/lib/home/homepage-layout";

const SKYLINES_IMAGE = "/images/collections/skylines-cover.png";
const SKYLINES_HREF = "/collections/skylines";

export default function HomeSkylines() {
  return (
    <section className="bg-[#FAFAF8]">
      <div className={`${HOME_EDITORIAL_CONTAINER} pt-14 pb-10 md:pt-16 md:pb-12`}>
        <Link
          href={SKYLINES_HREF}
          aria-label="Explore Skylines collection"
          className="group block w-full"
        >
          <Image
            src={SKYLINES_IMAGE}
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
