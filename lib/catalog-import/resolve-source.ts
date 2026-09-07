import fs from "fs";
import path from "path";
import {
  SKYLINE_SOURCE_EXTENSIONS,
  type CatalogImportVariant,
  type SkylineSourceExtension,
} from "@/lib/catalog-import/constants";
import { pathExists } from "@/lib/catalog-import/paths";

export type ResolvedVariantSource = {
  variant: CatalogImportVariant;
  absolutePath: string;
  filename: string;
  extension: SkylineSourceExtension;
};

function isSourceExtension(value: string): value is SkylineSourceExtension {
  return (SKYLINE_SOURCE_EXTENSIONS as readonly string[]).includes(value);
}

export function formatAcceptedVariantFilenames(basename: string): string {
  return SKYLINE_SOURCE_EXTENSIONS.map(
    (extension) => `${basename}.${extension}`,
  ).join(", ");
}

export function resolveVariantSourceFile(
  folderPath: string,
  variant: CatalogImportVariant,
): ResolvedVariantSource | null {
  const matches: ResolvedVariantSource[] = [];

  for (const extension of SKYLINE_SOURCE_EXTENSIONS) {
    const filename = `${variant.basename}.${extension}`;
    const absolutePath = path.join(folderPath, filename);

    if (!pathExists(absolutePath)) {
      continue;
    }

    matches.push({
      variant,
      absolutePath,
      filename,
      extension,
    });
  }

  if (matches.length === 0) {
    return null;
  }

  if (matches.length > 1) {
    throw new Error(
      `Multiple source files found for "${variant.key}": ${matches.map((match) => match.filename).join(", ")}. Keep one file per variant.`,
    );
  }

  return matches[0];
}

export function resolveProductVariantSources(
  folderPath: string,
  variants: CatalogImportVariant[],
): ResolvedVariantSource[] {
  const resolved: ResolvedVariantSource[] = [];

  for (const variant of variants) {
    const source = resolveVariantSourceFile(folderPath, variant);

    if (!source) {
      throw new Error(
        `Missing required file for "${variant.key}": ${formatAcceptedVariantFilenames(variant.basename)}`,
      );
    }

    resolved.push(source);
  }

  return resolved;
}

export function hasAllVariantSources(
  folderPath: string,
  variants: CatalogImportVariant[],
): boolean {
  try {
    resolveProductVariantSources(folderPath, variants);
    return true;
  } catch {
    return false;
  }
}

export function listMissingVariantSources(
  folderPath: string,
  variants: CatalogImportVariant[],
): string[] {
  const missing: string[] = [];

  for (const variant of variants) {
    const hasAny = SKYLINE_SOURCE_EXTENSIONS.some((extension) =>
      pathExists(path.join(folderPath, `${variant.basename}.${extension}`)),
    );

    if (!hasAny) {
      missing.push(formatAcceptedVariantFilenames(variant.basename));
    }
  }

  return missing;
}

export function readFileHeadBytes(absolutePath: string, length = 64 * 1024): Buffer {
  const fd = fs.openSync(absolutePath, "r");

  try {
    const buffer = Buffer.alloc(length);
    const bytesRead = fs.readSync(fd, buffer, 0, length, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    fs.closeSync(fd);
  }
}
