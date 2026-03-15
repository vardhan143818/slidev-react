import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

export interface SlidesDeckExtensions {
  themeId?: string;
  addonIds: string[];
}

function readDeckFrontmatter(slidesSourceFile: string) {
  try {
    const source = readFileSync(slidesSourceFile, "utf8");
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return {};

    return parseYaml(match[1]) ?? {};
  } catch {
    return {};
  }
}

function normalizeAddonIds(addonIds: unknown) {
  if (!Array.isArray(addonIds)) return [];

  return [...new Set(
    addonIds.map((addonId) => (typeof addonId === "string" ? addonId.trim() : ""))
      .filter(Boolean),
  )];
}

export function readSlidesDeckExtensions(slidesSourceFile: string): SlidesDeckExtensions {
  const frontmatter = readDeckFrontmatter(slidesSourceFile) as {
    theme?: unknown;
    addons?: unknown;
  };

  return {
    themeId: typeof frontmatter.theme === "string" ? frontmatter.theme.trim() || undefined : undefined,
    addonIds: normalizeAddonIds(frontmatter.addons),
  };
}
