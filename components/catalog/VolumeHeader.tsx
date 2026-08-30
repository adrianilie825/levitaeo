import Image from "next/image";
import EditorialBreadcrumb from "@/components/catalog/EditorialBreadcrumb";
import { getCollectionListingPath } from "@/lib/catalog/collections-public";
import type { Collection } from "@/types/collection";

type VolumeHeaderProps = {
  collection: Collection;
  volumeName: string;
  volumeDescription: string;
  coverImage: string;
  editionCount: number;
};

function formatCount(count: number, singular: string, plural: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

export default function VolumeHeader({
  collection,
  volumeName,
  volumeDescription,
  coverImage,
  editionCount,
}: VolumeHeaderProps) {
  return (
    <section className="border-b border-[#ECE8E2]">
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-12 md:pt-14 md:pb-16 lg:px-10">
        <EditorialBreadcrumb
          items={[
            { label: "Collections", href: "/collections" },
            {
              label: collection.title,
              href: getCollectionListingPath(collection),
            },
            { label: volumeName },
          ]}
        />

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">
          <div className="max-w-xl">
            <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
              {collection.title}
            </p>

            <h1 className="mt-6 text-[2.25rem] font-light leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-[3.25rem] lg:leading-[1.06]">
              {volumeName}
            </h1>

            <p className="mt-6 text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
              {volumeDescription}
            </p>

            <p className="mt-8 text-[12px] tracking-[0.1em] text-neutral-500">
              {formatCount(editionCount, "edition", "editions")}
            </p>
          </div>

          <div className="group relative mx-auto w-full max-w-[440px] lg:mx-0 lg:max-w-none lg:justify-self-end">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] border border-[#E8E4DE] bg-[#F7F5F1]">
              <Image
                src={coverImage}
                alt={`${volumeName} volume cover`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
            </div>

            <div className="absolute bottom-5 left-5 border border-[#ECE8E2] bg-[#FAFAF8] px-4 py-3 lg:bottom-8 lg:left-8">
              <p className="text-[10px] uppercase tracking-[0.38em] text-neutral-500">
                {collection.title}
              </p>
              <p className="mt-1.5 text-[11px] tracking-[0.12em] text-[#111111]">
                VOLUME
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
