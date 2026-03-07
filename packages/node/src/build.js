import { build, mergeConfig } from "vite";
import { createSlidesViteConfig } from "./slides/build/createSlidesViteConfig.ts";
import { createSuccessResult, parseBooleanFlag, resolveSlidesCommandContext } from "./context.js";

function readOptionValue(argv, index, optionName) {
  const current = argv[index];
  if (current.startsWith(`${optionName}=`)) {
    return {
      value: current.slice(optionName.length + 1),
      nextIndex: index,
    };
  }

  const nextValue = argv[index + 1];
  if (!nextValue || nextValue.startsWith("--")) {
    throw new Error(`Missing value for ${optionName}.`);
  }

  return {
    value: nextValue,
    nextIndex: index + 1,
  };
}

function parseBuildArgs(argv) {
  let slidesFile;
  let outDir;
  let base;
  let mode;
  let emptyOutDir;
  let sourcemap;
  let minify;

  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index];
    if (!entry.startsWith("--")) {
      if (!slidesFile) {
        slidesFile = entry;
        continue;
      }

      throw new Error(`Unknown build argument "${entry}".`);
    }

    if (entry === "--emptyOutDir") {
      emptyOutDir = true;
      continue;
    }

    if (entry === "--sourcemap") {
      sourcemap = true;
      continue;
    }

    if (entry === "--minify") {
      minify = true;
      continue;
    }

    if (entry === "--outDir" || entry.startsWith("--outDir=")) {
      const result = readOptionValue(argv, index, "--outDir");
      outDir = result.value;
      index = result.nextIndex;
      continue;
    }

    if (entry === "--base" || entry.startsWith("--base=")) {
      const result = readOptionValue(argv, index, "--base");
      base = result.value;
      index = result.nextIndex;
      continue;
    }

    if (entry === "--mode" || entry.startsWith("--mode=")) {
      const result = readOptionValue(argv, index, "--mode");
      mode = result.value;
      index = result.nextIndex;
      continue;
    }

    if (entry.startsWith("--emptyOutDir=")) {
      emptyOutDir = parseBooleanFlag(entry.slice("--emptyOutDir=".length));
      continue;
    }

    if (entry.startsWith("--sourcemap=")) {
      const value = entry.slice("--sourcemap=".length);
      sourcemap = value === "inline" || value === "hidden" ? value : parseBooleanFlag(value);
      continue;
    }

    if (entry.startsWith("--minify=")) {
      const value = entry.slice("--minify=".length);
      minify = value === "esbuild" || value === "terser" ? value : parseBooleanFlag(value);
      continue;
    }

    throw new Error(`Unknown build option "${entry}".`);
  }

  return {
    slidesFile,
    outDir,
    base,
    mode,
    emptyOutDir,
    sourcemap,
    minify,
  };
}

export async function buildSlidesApp(options = {}) {
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

export async function runSlidesBuild(options = {}) {
  await buildSlidesApp(options);
  return createSuccessResult();
}
