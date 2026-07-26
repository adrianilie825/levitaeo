import Image from "next/image";

const details = [
  { label: "Edition", value: "001" },
  { label: "Format", value: "High-resolution digital artwork" },
  { label: "Use", value: "Personal screens and printing" },
  { label: "Availability", value: "Limited Levitaeo edition" },
];

export default function FeaturedArtwork() {
  return (
    <section className="border-t border-[#ECE8E2] bg-[#F7F5F1] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">
          <div className="group relative mx-auto w-full max-w-[440px] lg:mx-0 lg:max-w-none">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] border border-[#E8E4DE]">
              <Image
                src="/images/collections/originals.png"
                alt="Originals No. 01 — Levitaeo edition"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.012]"
              />
            </div>

            <div className="absolute bottom-5 left-5 border border-[#ECE8E2] bg-[#FAFAF8] px-4 py-3 lg:bottom-8 lg:left-8">
              <p className="text-[10px] uppercase tracking-[0.38em] text-neutral-500">
                Levitaeo Originals
              </p>
              <p className="mt-1.5 text-[11px] tracking-[0.12em] text-[#111111]">
                EDITION 001
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:py-4">
            <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
              Featured Edition
            </p>

            <h2 className="mt-6 text-[2.25rem] font-light leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-[3rem]">
              Originals No. 01
            </h2>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
              A study in contrast, balance, and quiet intensity. Created as a
              limited digital edition for screens, interiors, and personal
              collections.
            </p>

            <dl className="mt-8 space-y-4 border-t border-[#ECE8E2] pt-8">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[7.5rem_1fr] gap-4 text-[13px] leading-6 sm:grid-cols-[8.5rem_1fr]"
                >
                  <dt className="tracking-[0.06em] text-neutral-500">
                    {item.label}
                  </dt>
                  <dd className="text-[#111111]">{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111]"
              >
                View the Edition
              </button>

              <a
                href="#"
                className="text-[12px] tracking-[0.1em] text-neutral-600 underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
              >
                Explore all Originals
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
