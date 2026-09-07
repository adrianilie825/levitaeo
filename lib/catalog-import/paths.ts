import fs from "fs";
import path from "path";

export function getCatalogImportRoot(): string {
  return path.join(process.cwd(), "catalog-import");
}

export function resolveCatalogImportPath(relativePath: string): string {
  const root = getCatalogImportRoot();
  const normalized = relativePath.replace(/^\/+/, "").replace(/\\/g, "/");
  const absolute = path.resolve(root, normalized);

  if (!absolute.startsWith(root)) {
    throw new Error("Import path must stay inside catalog-import.");
  }

  return absolute;
}

export function pathExists(targetPath: string): boolean {
  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

export function isDirectory(targetPath: string): boolean {
  try {
    return fs.statSync(targetPath).isDirectory();
  } catch {
    return false;
  }
}

export function readJsonFile<T>(filePath: string): T | null {
  if (!pathExists(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${filePath}: ${error instanceof Error ? error.message : "parse error"}`,
    );
  }
}

export function folderNameToTitle(folderName: string): string {
  return folderName
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeImportSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
