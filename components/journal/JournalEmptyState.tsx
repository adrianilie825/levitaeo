type JournalEmptyStateProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export default function JournalEmptyState({
  eyebrow = "The Journal",
  title,
  description,
}: JournalEmptyStateProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-0">
      <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
        {eyebrow}
      </p>

      <h2 className="mt-6 text-[1.75rem] font-light leading-[1.14] tracking-[-0.02em] text-[#111111] sm:text-[2rem]">
        {title}
      </h2>

      {description ? (
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}
