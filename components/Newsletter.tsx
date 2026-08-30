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

          <div className="lg:pt-2">
            <form className="space-y-4" aria-label="Join the Levitaeo Journal">
              <div>
                <label
                  htmlFor="journal-email"
                  className="sr-only"
                >
                  Your email address
                </label>
                <input
                  id="journal-email"
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  autoComplete="email"
                  disabled
                  aria-disabled="true"
                  className="w-full cursor-not-allowed border border-[#E8E4DE] bg-neutral-50 px-4 py-3.5 text-[14px] text-neutral-400 outline-none placeholder:text-neutral-400"
                />
              </div>

              <button
                type="button"
                disabled
                aria-disabled="true"
                className="inline-flex w-full cursor-not-allowed items-center justify-center border border-[#ECE8E2] bg-neutral-50 px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-neutral-400 sm:w-auto"
              >
                Coming soon
              </button>

              <p className="text-[11px] tracking-[0.08em] text-neutral-500">
                Journal sign-up is not available yet.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
