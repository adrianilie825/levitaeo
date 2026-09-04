import JournalEmptyState from "@/components/journal/JournalEmptyState";
import JournalFeaturedPost from "@/components/journal/JournalFeaturedPost";
import JournalPostCard from "@/components/journal/JournalPostCard";
import BrandPageShell from "@/components/brand/BrandPageShell";
import JsonLd from "@/components/JsonLd";
import { getPublishedJournalPosts } from "@/lib/journal/journal-db";
import { createPageMetadata, journalIndexJsonLd } from "@/lib/seo";

export const revalidate = 300;

const JOURNAL_DESCRIPTION =
  "Notes on digital art, visual culture, interiors and the evolving ways we live with images.";

export const metadata = createPageMetadata({
  title: "Journal",
  description: JOURNAL_DESCRIPTION,
  path: "/journal",
});

export default async function JournalPage() {
  const posts = await getPublishedJournalPosts();

  return (
    <BrandPageShell>
      <JsonLd
        data={journalIndexJsonLd({
          posts: posts.map((post) => ({
            title: post.title,
            slug: post.slug,
          })),
        })}
      />

      <section className="border-b border-[#ECE8E2]">
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-10 md:pt-16 md:pb-14 lg:px-10">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            Journal
          </p>

          <h1 className="mt-6 max-w-4xl text-[2.5rem] font-light leading-[1.08] tracking-[-0.03em] sm:text-4xl lg:text-[3.5rem] lg:leading-[1.06]">
            Ideas on art,
            <br />
            space and collecting.
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
            {JOURNAL_DESCRIPTION}
          </p>
        </div>
      </section>

      {posts.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-10">
          <JournalFeaturedPost post={posts[0]} />

          {posts.length > 1 ? (
            <div className="mt-16 border-t border-[#ECE8E2] pt-16 md:mt-20 md:pt-20 lg:mt-24 lg:pt-24">
              <div className="grid gap-14 md:grid-cols-2 md:gap-x-10 md:gap-y-16 lg:gap-x-14 lg:gap-y-20">
                {posts.slice(1).map((post) => (
                  <JournalPostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <JournalEmptyState
          title="First notes coming soon."
          description="Essays, observations and conversations around art, space and collecting."
        />
      )}
    </BrandPageShell>
  );
}
