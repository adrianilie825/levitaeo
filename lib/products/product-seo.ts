import { siteConfig } from "@/lib/site";

type ProductSeoSource = {
  title: string;
  subtitle?: string;
  description?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function resolveProductPageTitle(product: ProductSeoSource): string {
  return product.seoTitle?.trim() || product.title.trim();
}

export function resolveProductMetaDescription(product: ProductSeoSource): string {
  return (
    product.seoDescription?.trim() ||
    product.description?.trim() ||
    product.subtitle?.trim() ||
    siteConfig.description
  );
}

export function resolveProductPreviewAltText(
  product: Pick<ProductSeoSource, "title"> & {
    collection: string;
    previewAltText?: string | null;
  },
): string {
  if (product.previewAltText?.trim()) {
    return product.previewAltText.trim();
  }

  return `${product.title} — ${product.collection} digital artwork by Levitaeo`;
}
