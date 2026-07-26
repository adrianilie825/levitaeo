import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BuyButton from "@/components/BuyButton";
import CheckoutNotice from "@/components/CheckoutNotice";
import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";
import Newsletter from "@/components/Newsletter";
import ProductCard from "@/components/ProductCard";
import JsonLd from "@/components/JsonLd";
import {
  formatEditionLabel,
  getProductBySlug,
  getProductsByCollection,
} from "@/lib/products-db";
import { createPageMetadata, productJsonLd } from "@/lib/seo";
import type { Product } from "@/types/product";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

const includedItems = [
  { number: "01", text: "High-resolution master file" },
  { number: "02", text: "Screen-ready digital version" },
  { number: "03", text: "Personal printing rights" },
  { number: "04", text: "Instant account access" },
];

function formatPrice(product: Product): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: product.currency,
  }).format(product.price);
}

export async function generateStaticParams() {
  const products = await getProductsByCollection("originals");

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Edition Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return createPageMetadata({
    title: product.title,
    description: product.description,
    path: `/collections/originals/${product.slug}`,
    image: product.image,
  });
}

export default async function OriginalsProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const isAvailable = product.status === "available";

  const relatedProducts = (
    await getProductsByCollection(product.collectionSlug ?? "originals")
  )
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3);

  const purchaseDetails = [
    product.fileType,
    "Instant download after purchase",
    "Personal-use license included",
    "Suitable for screens and printing",
  ];

  const artworkSpecs = [
    { label: "Edition", value: product.edition },
    { label: "Collection", value: `Levitaeo ${product.collection}` },
    { label: "File type", value: product.fileType },
    { label: "Orientation", value: product.orientation },
    { label: "Recommended use", value: product.recommendedUse },
    { label: "License", value: product.license },
  ];

  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <JsonLd data={productJsonLd(product)} />
      <NavbarWithAuth />

      <section className="border-b border-[#ECE8E2]">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-12 md:pt-14 md:pb-16 lg:px-10">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">
            <div className="group relative mx-auto w-full max-w-[520px] lg:mx-0 lg:max-w-none">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] border border-[#E8E4DE]">
                <Image
                  src={product.image}
                  alt={`${product.title} artwork`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
            </div>

            <div className="max-w-lg lg:pt-2">
              <Suspense fallback={null}>
                <CheckoutNotice />
              </Suspense>

              <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
                Levitaeo Originals
              </p>

              <h1 className="mt-5 text-[2.25rem] font-light leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-[3rem]">
                {product.title}
              </h1>

              <p className="mt-3 text-[12px] tracking-[0.12em] text-neutral-500">
                {formatEditionLabel(product.edition)}
              </p>

              <p className="mt-6 text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
                {product.description}
              </p>

              {isAvailable && (
                <p className="mt-8 text-2xl font-light tracking-[-0.02em] sm:text-[1.75rem]">
                  {formatPrice(product)}
                </p>
              )}

              <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
                {isAvailable ? (
                  <BuyButton
                    productSlug={product.slug}
                    label="Acquire the Edition"
                  />
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex cursor-not-allowed items-center justify-center border border-neutral-300 bg-neutral-200 px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-neutral-500"
                  >
                    Coming Soon
                  </button>
                )}

                <a
                  href="#"
                  className="text-[12px] tracking-[0.1em] text-neutral-600 underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
                >
                  View licensing details
                </a>
              </div>

              <ul className="mt-8 space-y-2 border-t border-[#ECE8E2] pt-8 text-[13px] leading-6 text-neutral-600">
                {purchaseDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>

              <p className="mt-6 text-[11px] tracking-[0.1em] text-neutral-500">
                Limited Levitaeo edition · {product.availabilityText}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#ECE8E2] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">
            <div>
              <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
                The Edition
              </p>

              <h2 className="mt-5 text-[2rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-3xl">
                Designed for quiet visual impact.
              </h2>

              <p className="mt-5 max-w-lg text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
                {product.title} explores proportion, contrast, and negative
                space through a restrained composition developed for
                contemporary screens and interiors.
              </p>
            </div>

            <dl className="space-y-4 border-t border-[#ECE8E2] pt-8 lg:border-t-0 lg:pt-0">
              {artworkSpecs.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[8.5rem_1fr] gap-4 text-[13px] leading-6 sm:grid-cols-[9.5rem_1fr]"
                >
                  <dt className="tracking-[0.06em] text-neutral-500">
                    {item.label}
                  </dt>
                  <dd className="text-[#111111]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-t border-[#ECE8E2] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="text-[1.75rem] font-light tracking-[-0.02em] sm:text-2xl">
            What you receive
          </h2>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {includedItems.map((item) => (
              <div key={item.number}>
                <p className="text-[11px] tracking-[0.28em] text-neutral-400">
                  {item.number}
                </p>
                <p className="mt-4 text-[15px] leading-7 text-[#111111]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-t border-[#ECE8E2] py-12 md:py-16"
        aria-labelledby="related-heading"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="text-[11px] font-normal uppercase tracking-[0.44em] text-neutral-500">
            Continue Exploring
          </p>

          <h2
            id="related-heading"
            className="mt-5 text-[2rem] font-light leading-[1.12] tracking-[-0.02em] sm:text-3xl"
          >
            More from Originals.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 lg:gap-x-10">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.slug} product={relatedProduct} />
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </main>
  );
}
