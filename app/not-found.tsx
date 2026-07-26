import Link from "next/link";
import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";

export default function NotFound() {
  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <NavbarWithAuth />
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-20 lg:px-10">
        <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
          Levitaeo
        </p>
        <h1 className="mt-5 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-7 text-neutral-600">
          The page you requested is unavailable or may have moved.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111]"
          >
            Back to Home
          </Link>
          <Link
            href="/collections"
            className="inline-flex items-center justify-center border border-[#ECE8E2] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:border-[#111111]"
          >
            Browse Collections
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
