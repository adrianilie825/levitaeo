import Image from "next/image";
import Link from "next/link";
import {
  formatEditionLabel,
  getProductPath,
  formatProductStatus,
} from "@/lib/products-db";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const isAvailable = product.status === "available";
  const statusLabel = formatProductStatus(product.status);
  const editionLabel = formatEditionLabel(product.edition);
  const href = getProductPath(product);

  const imageBlock = (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px]">
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
  );

  const meta = (
    <>
      <h3 className="mt-4 text-lg font-light tracking-[-0.01em] sm:text-xl">
        {isAvailable ? (
          <Link
            href={href}
            className="transition-colors hover:text-neutral-600"
          >
            {product.title}
          </Link>
        ) : (
          <span className="text-neutral-700">{product.title}</span>
        )}
      </h3>

      <p className="mt-2 text-[12px] tracking-[0.08em] text-neutral-500">
        {editionLabel}
      </p>

      <p
        className={`mt-3 text-[11px] uppercase tracking-[0.14em] ${
          isAvailable ? "text-[#111111]" : "text-neutral-400"
        }`}
      >
        {statusLabel}
      </p>
    </>
  );

  if (isAvailable) {
    return (
      <article className="group transition-transform duration-300 ease-out hover:-translate-y-[3px]">
        <Link href={href} aria-label={`View ${product.title}`} className="block">
          {imageBlock}
        </Link>
        {meta}
      </article>
    );
  }

  return (
    <article aria-disabled="true" className="opacity-90">
      {imageBlock}
      {meta}
    </article>
  );
}
