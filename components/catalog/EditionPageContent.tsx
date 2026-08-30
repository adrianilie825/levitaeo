import ArtworkDescription from "@/components/artwork/ArtworkDescription";
import ArtworkGallery from "@/components/artwork/ArtworkGallery";
import ArtworkPurchasePanel from "@/components/artwork/ArtworkPurchasePanel";
import ArtworkStickyBar from "@/components/artwork/ArtworkStickyBar";
import RelatedArtworks from "@/components/artwork/RelatedArtworks";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import Newsletter from "@/components/Newsletter";
import { getAuthenticatedUser } from "@/lib/auth";
import { getRelatedProducts } from "@/lib/products/get-related-products";
import { isProductPurchasable } from "@/lib/products/product-purchase";
import { userOwnsActiveProduct } from "@/lib/purchases/ownership";
import { getProductPath } from "@/lib/products-db";
import { productJsonLd } from "@/lib/seo";
import type { Product } from "@/types/product";

type EditionPageContentProps = {
  product: Product;
};

export default async function EditionPageContent({
  product,
}: EditionPageContentProps) {
  const canPurchase = isProductPurchasable(product);
  const authenticatedUser = await getAuthenticatedUser();
  const isOwned = authenticatedUser
    ? await userOwnsActiveProduct({
        userId: authenticatedUser.id,
        productSlug: product.slug,
        productId: product.id,
      })
    : false;
  const relatedProducts = await getRelatedProducts(product, 4);
  const structuredDescription =
    product.description?.trim() ||
    product.subtitle?.trim() ||
    undefined;

  const jsonLdData =
    product.title.trim() && product.image.trim() && structuredDescription
      ? productJsonLd({
          ...product,
          description: structuredDescription,
        })
      : null;

  return (
    <main className="overflow-x-hidden bg-[#FAFAF8] pb-24 text-[#111111] md:pb-0">
      {jsonLdData ? <JsonLd data={jsonLdData} /> : null}
      <NavbarWithAuth />

      <section className="border-b border-[#ECE8E2]">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-12 md:pt-14 md:pb-16 lg:px-10">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:gap-x-16 xl:gap-x-20">
            <ArtworkGallery product={product} />

            <div className="lg:sticky lg:top-24 lg:self-start">
              <ArtworkPurchasePanel
                product={product}
                canPurchase={canPurchase}
                isAuthenticated={Boolean(authenticatedUser)}
                isOwned={isOwned}
              />
            </div>
          </div>
        </div>
      </section>

      <ArtworkDescription description={product.description} />

      <RelatedArtworks
        products={relatedProducts}
        collectionName={product.collection}
      />

      <Newsletter />
      <Footer />

      <ArtworkStickyBar
        product={product}
        productPath={getProductPath(product)}
        canPurchase={canPurchase}
        isAuthenticated={Boolean(authenticatedUser)}
        isOwned={isOwned}
      />
    </main>
  );
}
