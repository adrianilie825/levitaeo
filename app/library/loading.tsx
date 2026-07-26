import Footer from "@/components/Footer";
import LibraryHeader from "@/components/library/LibraryHeader";
import LibrarySkeleton from "@/components/library/LibrarySkeleton";
import NavbarWithAuth from "@/components/NavbarWithAuth";

export default function LibraryLoading() {
  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <NavbarWithAuth />
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:px-10">
        <LibraryHeader count={0} />
        <div className="mt-12">
          <LibrarySkeleton />
        </div>
      </section>
      <Footer />
    </main>
  );
}
