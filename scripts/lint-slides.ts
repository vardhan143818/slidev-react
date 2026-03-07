import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseSlides } from "../src/slides/parsing/parseSlides";
import { validateSlidesAuthoring } from "../src/slides/validation/validateSlidesAuthoring";

function parseArgs(argv: string[]) {
  let slidesFile = "slides.mdx";
  let strict = false;

  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index];
    if (entry === "--strict") {
      strict = true;
      continue;
    }

    if (entry === "--file" && argv[index + 1]) {
      slidesFile = argv[index + 1];
      index += 1;
      continue;
    }

    if (!entry.startsWith("--")) {
      slidesFile = entry;
    }
  }

  return {
    slidesFile,
    strict,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const slidesSourceFile = path.resolve(options.slidesFile);
  const source = await readFile(slidesSourceFile, "utf8");
  const slides = parseSlides(source);
  const warnings = await validateSlidesAuthoring({
    appRoot: process.cwd(),
    slides,
  });

  if (warnings.length === 0) {
    console.log(
      `Slides lint passed: no authoring warnings for ${path.relative(process.cwd(), slidesSourceFile)}`,
    );
    return;
  }

  console.warn(`Slides lint found ${warnings.length} warning${warnings.length === 1 ? "" : "s"}:`);
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }

  if (options.strict) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Slides lint failed: ${message}`);
  process.exitCode = 1;
});
