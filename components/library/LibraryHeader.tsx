type LibraryHeaderProps = {
  count: number;
};

export default function LibraryHeader({ count }: LibraryHeaderProps) {
  return (
    <header className="border-b border-[#ECE8E2] pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
            Levitaeo Collection
          </p>
          <h1 className="mt-4 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
            My Library
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-neutral-600">
            Your purchased digital editions.
          </p>
        </div>

        <div
          aria-label={`${count} artwork${count === 1 ? "" : "s"} in your library`}
          className="inline-flex w-fit items-center border border-[#ECE8E2] bg-white px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[#111111]"
        >
          {count} {count === 1 ? "Edition" : "Editions"}
        </div>
      </div>
    </header>
  );
}
