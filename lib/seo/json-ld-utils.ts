export const SCHEMA_ORG_CONTEXT = "https://schema.org";

export type JsonLdNode = Record<string, unknown>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidJsonLdRootNode(node: unknown): node is JsonLdNode {
  if (!isPlainObject(node)) {
    return false;
  }

  const context = node["@context"];
  const type = node["@type"];

  return (
    typeof context === "string" &&
    context.trim().length > 0 &&
    typeof type === "string" &&
    type.trim().length > 0
  );
}

function isValidGraphMember(node: unknown): node is JsonLdNode {
  return isPlainObject(node) && typeof node["@type"] === "string";
}

function stripRedundantContext(node: JsonLdNode): JsonLdNode {
  const { ["@context"]: _context, ...rest } = node;
  return rest;
}

function normalizeGraphMembers(nodes: JsonLdNode[]): JsonLdNode[] {
  return nodes
    .map((node) => {
      if (!isValidGraphMember(node)) {
        return null;
      }

      if (isValidJsonLdRootNode(node)) {
        return stripRedundantContext(node);
      }

      return node;
    })
    .filter((node): node is JsonLdNode => node !== null);
}

function normalizeGraphRoot(root: JsonLdNode): JsonLdNode | null {
  const graph = root["@graph"];

  if (!Array.isArray(graph)) {
    return isValidJsonLdRootNode(root) ? root : null;
  }

  const members = normalizeGraphMembers(graph);

  if (members.length === 0) {
    return null;
  }

  return {
    "@context": SCHEMA_ORG_CONTEXT,
    "@graph": members,
  };
}

/**
 * Normalizes JSON-LD payloads for safe rendering.
 * Bare top-level arrays break Safari/WebKit structured-data parsing because the
 * runtime expects a root object with `@context`.
 */
export function normalizeJsonLdInput(data: unknown): JsonLdNode | null {
  if (data == null) {
    return null;
  }

  if (Array.isArray(data)) {
    const members = normalizeGraphMembers(
      data.filter((entry): entry is JsonLdNode => isPlainObject(entry)),
    );

    if (members.length === 0) {
      return null;
    }

    if (members.length === 1) {
      return {
        "@context": SCHEMA_ORG_CONTEXT,
        ...members[0],
      };
    }

    return {
      "@context": SCHEMA_ORG_CONTEXT,
      "@graph": members,
    };
  }

  if (!isPlainObject(data)) {
    return null;
  }

  if ("@graph" in data) {
    return normalizeGraphRoot(data);
  }

  return isValidJsonLdRootNode(data) ? data : null;
}

export function serializeJsonLd(data: unknown): string | null {
  const normalized = normalizeJsonLdInput(data);

  if (!normalized) {
    return null;
  }

  return JSON.stringify(normalized).replace(/</g, "\\u003c");
}
