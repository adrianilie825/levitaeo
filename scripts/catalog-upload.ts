#!/usr/bin/env node

import { discoverImportTargets } from "@/lib/catalog-import/discover";
import {
  assertCatalogImportEnvironment,
  assertServerOnlyRuntime,
} from "@/lib/catalog-import/env";
import { importValidatedProduct } from "@/lib/catalog-import/import-product";
import {
  printBatchSummary,
  printImportError,
  printImportPlan,
  printProductDryRun,
  printValidatedProduct,
} from "@/lib/catalog-import/reporter";
import { validateProductImport } from "@/lib/catalog-import/validate";

function parseArgs(argv: string[]): {
  targetPath: string;
  dryRun: boolean;
} {
  const args = argv.filter((arg) => arg !== "--dry-run");
  const dryRun = argv.includes("--dry-run");

  if (args.length === 0) {
    throw new Error(
      "Usage: npm run catalog:upload -- <collection/product|collection> [--dry-run]",
    );
  }

  return {
    targetPath: args[0].replace(/^\/+|\/+$/g, ""),
    dryRun,
  };
}

async function main() {
  assertServerOnlyRuntime();

  const { targetPath, dryRun } = parseArgs(process.argv.slice(2));
  assertCatalogImportEnvironment();

  const folders = discoverImportTargets(targetPath);
  printImportPlan({
    dryRun,
    targetPath,
    productCount: folders.length,
  });

  const results = [];
  let failures = 0;

  for (const folder of folders) {
    const label = `${folder.collectionSlug}/${folder.productFolderName}`;

    try {
      const validated = validateProductImport(folder);

      if (!validated.ok) {
        failures += 1;
        printImportError(label, validated.errors.join("; "));
        continue;
      }

      if (dryRun) {
        printProductDryRun({
          title: validated.value.metadata.title,
          slug: validated.value.metadata.slug,
          resolution: validated.value.metadata.resolution,
          fileType: validated.value.metadata.fileType,
          assets: validated.value.assets,
          printMasterWarnings: validated.value.printMasterWarnings,
        });

        results.push(
          await importValidatedProduct(validated.value, { dryRun: true }),
        );
        continue;
      }

      printValidatedProduct({
        title: validated.value.metadata.title,
        slug: validated.value.metadata.slug,
        dryRun: false,
        resolution: validated.value.metadata.resolution,
        fileType: validated.value.metadata.fileType,
        assets: validated.value.assets,
        printMasterWarnings: validated.value.printMasterWarnings,
      });

      const result = await importValidatedProduct(validated.value, {
        dryRun: false,
      });

      console.log(
        `${result.action === "created" ? "+" : "↻"} Imported ${result.slug}`,
      );
      results.push(result);
    } catch (error) {
      failures += 1;
      printImportError(label, error);
    }
  }

  if (results.length > 0) {
    printBatchSummary(results);
  }

  if (failures > 0) {
    console.error("");
    console.error(`${failures} product folder${failures === 1 ? "" : "s"} failed.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  printImportError("catalog import", error);
  process.exit(1);
});
