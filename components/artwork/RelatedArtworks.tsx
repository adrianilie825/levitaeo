import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

type RelatedArtworksProps = {
  products: Product[];
  collectionName: string;
};

export default function RelatedArtworks({
  products,
  collectionName,
}: RelatedArtworksProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className="border-t border-[#ECE8E2] py-12 md:py-16"
      aria-labelledby="related-artworks-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
          More from this collection
        </p>

        <h2
          id="related-artworks-heading"
          className="mt-4 text-[1.75rem] font-light tracking-[-0.02em] sm:text-2xl"
        >
          More from {collectionName}
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-10">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              showPrice
              showCollection
            />
          ))}
        </div>
      </div>
    </section>
  );
}
