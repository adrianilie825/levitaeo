import { getArtworkDescriptionParagraphs } from "@/lib/products/artwork-display";

type ArtworkDescriptionProps = {
  description?: string;
};

export default function ArtworkDescription({
  description,
}: ArtworkDescriptionProps) {
  const paragraphs = getArtworkDescriptionParagraphs(description);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <section
      className="border-t border-[#ECE8E2] py-12 md:py-16"
      aria-labelledby="artwork-description-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <h2
          id="artwork-description-heading"
          className="text-[11px] uppercase tracking-[0.32em] text-neutral-500"
        >
          About this artwork
        </h2>

        <div className="mt-8 max-w-2xl space-y-6 text-[15px] leading-8 text-neutral-600 sm:text-base">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
