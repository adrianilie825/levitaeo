import Link from "next/link";

export default function EmptyLibrary() {
  return (
    <section className="border border-[#ECE8E2] bg-white px-6 py-16 text-center sm:px-10 sm:py-20">
      <h2 className="text-2xl font-light tracking-[-0.02em] text-[#111111] sm:text-3xl">
        Your collection is empty.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-neutral-600">
        Acquire an edition to begin your collection.
      </p>
      <Link
        href="/collections"
        className="mt-8 inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111]"
      >
        Explore Collections
      </Link>
    </section>
  );
}
