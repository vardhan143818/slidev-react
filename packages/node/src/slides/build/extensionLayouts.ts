import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { ResolvedAddonExtension, ResolvedThemeExtension } from "./resolvedExtensions.ts";

const require = createRequire(import.meta.url);

function extractStringArrayLiteral(source: string, propertyName: string) {
  const propertyIndex = source.indexOf(`${propertyName}:`);
  if (propertyIndex === -1) return [];

  const arrayStart = source.indexOf("[", propertyIndex);
  if (arrayStart === -1) return [];

  let depth = 0;
  let arrayEnd = -1;
  for (let index = arrayStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "[") depth += 1;
    if (char === "]") depth -= 1;

    if (depth === 0) {
      arrayEnd = index;
      break;
    }
  }

  if (arrayEnd === -1) return [];

  const arrayBody = source.slice(arrayStart + 1, arrayEnd);
  const values = arrayBody.matchAll(/["']([^"']+)["']/g);

  return [...values]
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value));
}

function readLayoutsFromLocalDefinition(definitionFilePath: string) {
  try {
    const source = readFileSync(definitionFilePath, "utf8");
    return extractStringArrayLiteral(source, "layoutIds");
  } catch {
    return [];
  }
}

function readLayoutsFromResolvedImport(importPath: string) {
  try {
    const resolvedImportPath = importPath.startsWith("file:")
      ? path.normalize(new URL(importPath).pathname)
      : require.resolve(importPath);
    const source = readFileSync(resolvedImportPath, "utf8");
    return extractStringArrayLiteral(source, "layoutIds");
  } catch {
    return [];
  }
}

export function readThemeLayoutIds(resolvedTheme: ResolvedThemeExtension | null) {
  if (!resolvedTheme) return [];

  if (resolvedTheme.source === "local" && resolvedTheme.definitionFilePath) {
    return readLayoutsFromLocalDefinition(resolvedTheme.definitionFilePath);
  }

  return readLayoutsFromResolvedImport(resolvedTheme.importPath);
}

export function readAddonLayoutIds(resolvedAddon: ResolvedAddonExtension | null) {
  if (!resolvedAddon) return [];

  if (resolvedAddon.source === "local" && resolvedAddon.definitionFilePath) {
    return readLayoutsFromLocalDefinition(resolvedAddon.definitionFilePath);
  }

  return readLayoutsFromResolvedImport(resolvedAddon.importPath);
}
