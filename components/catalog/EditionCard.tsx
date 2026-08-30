import Image from "next/image";
import Link from "next/link";
import EditionCardPurchase from "@/components/catalog/EditionCardPurchase";
import { formatArtworkPrice } from "@/lib/products/artwork-display";
import { isProductPurchasable } from "@/lib/products/product-purchase";
import {
  formatEditionLabel,
  formatProductStatus,
  getProductPath,
} from "@/lib/products-db";
import type { Product } from "@/types/product";

type EditionCardProps = {
  product: Product;
  isAuthenticated: boolean;
  isOwned: boolean;
};

export default function EditionCard({
  product,
  isAuthenticated,
  isOwned,
}: EditionCardProps) {
  const isAvailable = product.status === "available";
  const canPurchase = isProductPurchasable(product);
  const editionLabel = formatEditionLabel(product.edition);
  const statusLabel = formatProductStatus(product.status);
  const href = getProductPath(product);

  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        aria-label={`View ${product.title}`}
        className="block overflow-hidden rounded-[3px]"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] border border-[#E8E4DE] bg-[#F7F5F1]">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-700 ease-out ${
              isAvailable ? "group-hover:scale-[1.03]" : "opacity-80"
            }`}
          />
        </div>
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-[12px] tracking-[0.08em] text-neutral-500">
          {editionLabel}
        </p>

        <Link
          href={href}
          className="mt-2 text-lg font-light tracking-[-0.01em] transition-colors hover:text-neutral-600 sm:text-xl"
        >
          {product.title}
        </Link>

        {isAvailable ? (
          <p className="mt-3 text-[15px] font-light tracking-[-0.01em] text-[#111111]">
            {formatArtworkPrice(product)}
          </p>
        ) : null}

        <p
          className={`mt-2 text-[11px] uppercase tracking-[0.14em] ${
            isAvailable ? "text-[#111111]" : "text-neutral-400"
          }`}
        >
          {statusLabel}
        </p>

        <div className="mt-5">
          <EditionCardPurchase
            productSlug={product.slug}
            productPath={href}
            canPurchase={canPurchase}
            isAuthenticated={isAuthenticated}
            isOwned={isOwned}
            isAvailable={isAvailable}
          />
        </div>
      </div>
    </article>
  );
}
