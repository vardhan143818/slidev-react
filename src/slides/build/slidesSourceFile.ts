import path from "node:path";

const DEFAULT_SLIDES_SOURCE_FILE = "slides.mdx";

export function resolveSlidesSourceFile(appRoot: string) {
  const configuredSlidesFile = process.env.SLIDES_FILE?.trim() || DEFAULT_SLIDES_SOURCE_FILE;
  return path.resolve(appRoot, configuredSlidesFile);
}
