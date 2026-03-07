import { build, mergeConfig } from "vite";
import { parseBuildArgs } from "./cli/buildArgs.ts";
import { createSlidesViteConfig } from "./slides/build/createSlidesViteConfig.ts";
import {
  createSuccessResult,
  resolveSlidesCommandContext,
  type CommandResult,
  type SlidesCommandOptions,
} from "./context.ts";

export interface BuildSlidesOptions extends SlidesCommandOptions {
  viteArgs?: string[];
}

export async function buildSlidesApp(options: BuildSlidesOptions = {}) {
  const parsedArgs = parseBuildArgs(options.viteArgs ?? []);
  const context = resolveSlidesCommandContext({
    ...options,
    slidesFile: options.slidesFile ?? parsedArgs.slidesFile,
  });
  const buildConfig = mergeConfig(createSlidesViteConfig(context), {
    configFile: false,
    mode: parsedArgs.mode,
    base: parsedArgs.base,
    build: {
      outDir: parsedArgs.outDir,
      emptyOutDir: parsedArgs.emptyOutDir,
      sourcemap: parsedArgs.sourcemap,
      minify: parsedArgs.minify,
    },
  });

  await build(buildConfig);
}

export async function runSlidesBuild(options: BuildSlidesOptions = {}): Promise<CommandResult> {
  await buildSlidesApp(options);
  return createSuccessResult();
}
