import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseLintArgs } from "./cli/lintArgs.ts";
import { parseSlides } from "./slides/parsing/parseSlides.ts";
import { validateSlidesAuthoring } from "./slides/validation/validateSlidesAuthoring.ts";
import {
  createFailureResult,
  createSuccessResult,
  resolveSlidesCommandContext,
  type CommandResult,
  type SlidesCommandOptions,
} from "./context.ts";

export interface LintSlidesOptions extends SlidesCommandOptions {
  cliArgs?: string[];
}

export interface LintSlidesResult {
  strict: boolean;
  warnings: string[];
  slidesSourceFile: string;
}

export async function lintSlides(options: LintSlidesOptions = {}): Promise<LintSlidesResult> {
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

export async function runSlidesLint(options: LintSlidesOptions = {}): Promise<CommandResult> {
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
