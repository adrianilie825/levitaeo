const pillars = [
  {
    number: "01",
    title: "Curated Editions",
    text: "Every artwork is selected for visual character, balance, and lasting relevance.",
  },
  {
    number: "02",
    title: "Exceptional Quality",
    text: "High-resolution digital files prepared for modern screens and premium printing.",
  },
  {
    number: "03",
    title: "Instant Ownership",
    text: "Access your edition immediately and enjoy it across your personal spaces.",
  },
];

export default function WhyLevitaeo() {
  return (
    <section className="border-t border-[#ECE8E2] bg-[#FAFAF8] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            Why Levitaeo
          </p>

          <h2 className="mt-8 text-[2.25rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-4xl lg:text-[3.25rem] lg:leading-[1.08]">
            Art designed to be collected,
            <br />
            not endlessly scrolled.
          </h2>

          <p className="mt-8 max-w-2xl text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            Levitaeo brings together distinctive digital editions created for
            screens, interiors, and personal collections.
          </p>
        </div>

        <div className="mt-16 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[#ECE8E2]">
          {pillars.map((pillar) => (
            <div
              key={pillar.number}
              className="md:px-10 md:first:pl-0 md:last:pr-0"
            >
              <p className="text-[11px] tracking-[0.28em] text-neutral-400">
                {pillar.number}
              </p>

              <h3 className="mt-5 text-xl font-light tracking-[-0.01em] text-[#111111] sm:text-2xl">
                {pillar.title}
              </h3>

              <p className="mt-4 max-w-sm text-[15px] leading-7 text-neutral-600">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
