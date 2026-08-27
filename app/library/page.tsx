import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ArtworkCard from "@/components/library/ArtworkCard";
import EmptyLibrary from "@/components/library/EmptyLibrary";
import LibraryHeader from "@/components/library/LibraryHeader";
import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import {
  getAuthenticatedUser,
  linkPurchasesToAuthenticatedUser,
} from "@/lib/auth";
import { getCurrentUserLibrary, type LibraryArtwork } from "@/lib/library";

export const metadata: Metadata = {
  title: "My Library",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?next=/library");
  }

  try {
    await linkPurchasesToAuthenticatedUser(user);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[library] Purchase linking failed:", error);
    }
  }

  let artworks: LibraryArtwork[] = [];
  let loadError = false;

  try {
    const library = await getCurrentUserLibrary();
    artworks = library?.artworks ?? [];
  } catch (error) {
    loadError = true;
    console.error("[library] Failed to load library:", {
      error:
        typeof error === "object" && error !== null && "message" in error
          ? {
              message: String(error.message),
              code: "code" in error ? String(error.code) : undefined,
              details: "details" in error ? String(error.details) : undefined,
              hint: "hint" in error ? String(error.hint) : undefined,
            }
          : { message: String(error) },
    });
  }

  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <NavbarWithAuth />
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:px-10">
        <LibraryHeader count={artworks.length} />

        {loadError ? (
          <p
            className="mt-12 border border-[#ECE8E2] bg-white px-6 py-5 text-[15px] leading-7 text-neutral-600"
            role="alert"
          >
            Your library could not be loaded right now. Please refresh the page
            or try again in a moment.
          </p>
        ) : (
          <div className="mt-12">
            {artworks.length === 0 ? (
              <EmptyLibrary />
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {artworks.map((artwork) => (
                  <ArtworkCard key={artwork.entitlementId} artwork={artwork} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
