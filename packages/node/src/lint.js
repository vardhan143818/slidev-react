import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseSlides } from "./slides/parsing/parseSlides.ts";
import { validateSlidesAuthoring } from "./slides/validation/validateSlidesAuthoring.ts";
import {
  createFailureResult,
  createSuccessResult,
  resolveSlidesCommandContext,
} from "./context.js";

function parseLintArgs(argv) {
  let slidesFile;
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

    if (entry.startsWith("--file=")) {
      slidesFile = entry.slice("--file=".length);
      continue;
    }

    if (!entry.startsWith("--")) {
      slidesFile = entry;
      continue;
    }

    throw new Error(`Unknown lint option "${entry}".`);
  }

  return {
    slidesFile,
    strict,
  };
}

export async function lintSlides(options = {}) {
  const parsedArgs = parseLintArgs(options.cliArgs ?? []);
  const context = resolveSlidesCommandContext({
    ...options,
    slidesFile: options.slidesFile ?? parsedArgs.slidesFile,
  });
  const source = await readFile(context.slidesSourceFile, "utf8");
  const slides = parseSlides(source);
  const warnings = await validateSlidesAuthoring({
    appRoot: context.appRoot,
    slides,
  });

  return {
    strict: parsedArgs.strict,
    warnings,
    slidesSourceFile: context.slidesSourceFile,
  };
}

export async function runSlidesLint(options = {}) {
  const result = await lintSlides(options);

  if (result.warnings.length === 0) {
    console.log(
      `Slides lint passed: no authoring warnings for ${path.relative(process.cwd(), result.slidesSourceFile)}`,
    );
    return createSuccessResult();
  }

  console.warn(
    `Slides lint found ${result.warnings.length} warning${result.warnings.length === 1 ? "" : "s"}:`,
  );
  for (const warning of result.warnings) {
    console.warn(`- ${warning}`);
  }

  return result.strict ? createFailureResult(1) : createSuccessResult();
}
