type EditorialPageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  bordered?: boolean;
};

export default function EditorialPageHero({
  eyebrow,
  title,
  description,
  bordered = true,
}: EditorialPageHeroProps) {
  return (
    <section className={bordered ? "border-b border-[#ECE8E2]" : undefined}>
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-10 md:pt-16 md:pb-14 lg:px-10">
        <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
          {eyebrow}
        </p>

        <h1 className="mt-6 max-w-3xl text-[2.5rem] font-light leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-[3.5rem] lg:leading-[1.06]">
          {title}
        </h1>

        {description ? (
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
