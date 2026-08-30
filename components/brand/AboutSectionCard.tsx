import Link from "next/link";

type AboutSectionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

export default function AboutSectionCard({
  eyebrow,
  title,
  description,
  href,
  cta,
}: AboutSectionCardProps) {
  return (
    <article className="group flex flex-col border border-[#ECE8E2] bg-[#FAFAF8] p-8 transition-colors duration-300 hover:border-[#D8D2C8] md:p-10">
      <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
        {eyebrow}
      </p>

      <h2 className="mt-5 text-2xl font-light tracking-[-0.02em] text-[#111111] sm:text-[1.75rem]">
        {title}
      </h2>

      <p className="mt-4 flex-1 text-[15px] leading-7 text-neutral-600">
        {description}
      </p>

      <Link
        href={href}
        className="mt-8 inline-flex items-center text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors group-hover:text-neutral-600"
      >
        {cta}
        <span aria-hidden="true" className="ml-2 transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </Link>
    </article>
  );
}
