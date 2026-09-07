import type { ImportProductResult } from "@/lib/catalog-import/import-product";
import { PRINT_MASTER_WARNING } from "@/lib/catalog-import/constants";
import { formatDimensions } from "@/lib/catalog-import/image-dimensions";
import type { ValidatedImportAsset } from "@/lib/catalog-import/validate";

const ASSET_LABEL_WIDTH = 22;

function formatAssetLine(asset: ValidatedImportAsset): string {
  const label = asset.displayName.padEnd(ASSET_LABEL_WIDTH, ".");
  return `  ${label} ${asset.dimensions.format} | ${formatDimensions(asset.dimensions)}`;
}

export function printImportPlan(input: {
  dryRun: boolean;
  targetPath: string;
  productCount: number;
}): void {
  console.log("");
  console.log("Levitaeo catalog import");
  console.log(`Target: catalog-import/${input.targetPath}`);
  console.log(`Mode: ${input.dryRun ? "dry-run (no writes)" : "live import"}`);
  console.log(`Products discovered: ${input.productCount}`);
  console.log("");
}

export function printValidatedProduct(input: {
  title: string;
  slug: string;
  dryRun: boolean;
  assets: ValidatedImportAsset[];
  printMasterWarnings: string[];
}): void {
  if (input.dryRun) {
    console.log(`[dry-run] ${input.title}`);
    console.log(`  slug: ${input.slug}`);
    console.log(`  status: draft`);
  } else {
    console.log(`${input.title}`);
    console.log(`  slug: ${input.slug}`);
  }

  for (const asset of input.assets) {
    console.log(formatAssetLine(asset));
  }

  if (input.printMasterWarnings.length > 0) {
    console.log("");
    console.log(`  warning: ${PRINT_MASTER_WARNING}`);

    for (const warning of input.printMasterWarnings) {
      console.log(`    · ${warning}`);
    }
  }

  console.log("");
}

export function printProductDryRun(input: {
  title: string;
  slug: string;
  assets: ValidatedImportAsset[];
  printMasterWarnings: string[];
}): void {
  printValidatedProduct({
    ...input,
    dryRun: true,
  });
}

export function printBatchSummary(results: ImportProductResult[]): void {
  console.log("");
  console.log("Import summary");
  console.log("--------------");

  for (const result of results) {
    const marker =
      result.action === "dry-run"
        ? "~"
        : result.action === "created"
          ? "+"
          : "↻";
    console.log(`${marker} ${result.title.padEnd(24)} ${result.slug}`);
  }

  const productCount = results.length;
  const assetCount = results.reduce((total, result) => total + result.assetCount, 0);

  console.log("");
  console.log(`${productCount} product${productCount === 1 ? "" : "s"}`);
  console.log(`${assetCount} download asset${assetCount === 1 ? "" : "s"}`);
}

export function printImportError(label: string, error: unknown): void {
  const message =
    error instanceof Error ? error.message : "Unknown import error.";
  console.error(`✗ ${label}: ${message}`);
}
