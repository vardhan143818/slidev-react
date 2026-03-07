import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { SlidesDocument } from "../model/slides.ts";
import { layoutNames } from "../model/layout.ts";

const CLIENT_THEME_THEMES_DIR = "packages/client/src/theme/themes";
const CLIENT_ADDONS_DIR = "packages/client/src/addons";

function collectKnownLayouts() {
  return new Set<string>(layoutNames);
}

function formatSlideLabel(slide: SlidesDocument["slides"][number]) {
  return slide.meta.title
    ? `slide ${slide.index + 1} (${slide.meta.title})`
    : `slide ${slide.index + 1}`;
}

async function readLocalIds(rootDir: string) {
  try {
    const entries = await readdir(rootDir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch {
    return [];
  }
}

async function findDefinitionFile(rootDir: string) {
  const candidates = ["index.ts", "index.tsx", "index.js", "index.jsx"];

  for (const candidate of candidates) {
    const filePath = path.join(rootDir, candidate);

    try {
      await readFile(filePath, "utf8");
      return filePath;
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

function extractObjectLiteralKeys(source: string, propertyName: string) {
  const propertyIndex = source.indexOf(`${propertyName}:`);
  if (propertyIndex === -1) return [];

  const objectStart = source.indexOf("{", propertyIndex);
  if (objectStart === -1) return [];

  let depth = 0;
  let objectEnd = -1;
  for (let index = objectStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      objectEnd = index;
      break;
    }
  }

  if (objectEnd === -1) return [];

  const objectBody = source.slice(objectStart + 1, objectEnd);
  const keys = objectBody.matchAll(/(?:^|\n|\s)(["']?[\w-]+["']?)\s*:/g);

  return [...keys]
    .map((match) => match[1]?.replace(/^["']|["']$/g, ""))
    .filter((key): key is string => Boolean(key));
}

async function readCustomLayoutIds(rootDir: string) {
  const ids = await readLocalIds(rootDir);
  const layouts = new Set<string>();

  await Promise.all(
    ids.map(async (id) => {
      const definitionFile = await findDefinitionFile(path.join(rootDir, id));
      if (!definitionFile) return;

      try {
        const source = await readFile(definitionFile, "utf8");
        for (const layoutName of extractObjectLiteralKeys(source, "layouts")) {
          layouts.add(layoutName);
        }
      } catch {
        // Ignore broken local definitions here. Build/runtime will report them separately.
      }
    }),
  );

  return layouts;
}

export async function validateSlidesAuthoring({
  appRoot,
  slides,
}: {
  appRoot: string;
  slides: SlidesDocument;
}) {
  const warnings: string[] = [];
  const themeRootDir = path.join(appRoot, CLIENT_THEME_THEMES_DIR);
  const addonsRootDir = path.join(appRoot, CLIENT_ADDONS_DIR);
  const [themeIdList, addonIdList, themeLayouts, addonLayouts] = await Promise.all([
    readLocalIds(themeRootDir),
    readLocalIds(addonsRootDir),
    readCustomLayoutIds(themeRootDir),
    readCustomLayoutIds(addonsRootDir),
  ]);
  const themeIds = new Set(themeIdList);
  const addonIds = new Set(addonIdList);
  const knownLayouts = collectKnownLayouts();

  for (const layoutName of themeLayouts) knownLayouts.add(layoutName);
  for (const layoutName of addonLayouts) knownLayouts.add(layoutName);

  if (slides.meta.theme && !themeIds.has(slides.meta.theme)) {
    warnings.push(
      `Unknown theme "${slides.meta.theme}". The runtime will fall back to the default theme.`,
    );
  }

  for (const addonId of slides.meta.addons ?? []) {
    if (!addonIds.has(addonId)) {
      warnings.push(
        `Unknown addon "${addonId}". It will be ignored until a matching local addon exists.`,
      );
    }
  }

  if (slides.meta.layout && !knownLayouts.has(slides.meta.layout)) {
    warnings.push(
      `Unknown slides layout "${slides.meta.layout}". The runtime will fall back to the default layout.`,
    );
  }

  for (const slide of slides.slides) {
    const slideLayout = slide.meta.layout;
    if (!slideLayout || knownLayouts.has(slideLayout)) continue;

    warnings.push(
      `Unknown layout "${slideLayout}" in ${formatSlideLabel(slide)}. The runtime will fall back to the default layout.`,
    );
  }

  return warnings;
}
