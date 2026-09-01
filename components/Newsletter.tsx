import Link from "next/link";

export default function Newsletter() {
  return (
    <section
      id="journal"
      className="border-t border-[#ECE8E2] bg-[#FAFAF8] py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">
          <div className="max-w-lg">
            <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
              The Levitaeo Journal
            </p>

            <h2 className="mt-6 text-[2rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-3xl lg:text-[2.5rem]">
              New editions, quiet inspiration.
            </h2>

            <p className="mt-5 text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
              Receive new artwork releases, collection stories, and occasional
              notes from the Levitaeo studio.
            </p>
          </div>

          <div className="lg:pt-10">
            <p className="max-w-md text-[15px] leading-7 text-neutral-600">
              The Journal is being prepared. Explore our published collections
              or read about upcoming Membership in the meantime.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/collections"
                className="text-[12px] tracking-[0.1em] text-neutral-600 underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
              >
                Explore collections
              </Link>
              <span className="hidden text-neutral-300 sm:inline" aria-hidden="true">
                ·
              </span>
              <Link
                href="/faq#membership"
                className="text-[12px] tracking-[0.1em] text-neutral-600 underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
              >
                About Membership
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
