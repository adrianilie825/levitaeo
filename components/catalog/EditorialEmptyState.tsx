type EditorialEmptyStateProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export default function EditorialEmptyState({
  eyebrow,
  title,
  description,
}: EditorialEmptyStateProps) {
  return (
    <div className="mt-14 border border-[#ECE8E2] bg-[#F7F5F1]/70 px-8 py-16 text-center md:px-12 md:py-20">
      {eyebrow ? (
        <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
          {eyebrow}
        </p>
      ) : null}

      <p className="mt-4 text-xl font-light tracking-[-0.01em] text-[#111111] sm:text-2xl">
        {title}
      </p>

      {description ? (
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-neutral-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}
