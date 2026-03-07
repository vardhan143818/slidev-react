import { parseBooleanFlag } from "../context.ts";
import { readOptionValue } from "./readOptionValue.ts";

export interface BuildCliArgs {
  slidesFile?: string;
  outDir?: string;
  base?: string;
  mode?: string;
  emptyOutDir?: boolean;
  sourcemap?: boolean | "inline" | "hidden";
  minify?: boolean | "esbuild" | "terser";
}

export function parseBuildArgs(argv: string[]): BuildCliArgs {
  let slidesFile;
  let outDir;
  let base;
  let mode;
  let emptyOutDir;
  let sourcemap: BuildCliArgs["sourcemap"];
  let minify: BuildCliArgs["minify"];

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
      sourcemap =
        value === "inline" || value === "hidden"
          ? value
          : parseBooleanFlag(value);
      continue;
    }

    if (entry.startsWith("--minify=")) {
      const value = entry.slice("--minify=".length);
      minify =
        value === "esbuild" || value === "terser"
          ? value
          : parseBooleanFlag(value);
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
