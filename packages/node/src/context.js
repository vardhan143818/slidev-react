import path from "node:path";
import { resolveSlidesSourceFile } from "./slides/build/slidesSourceFile.ts";

export function createSuccessResult() {
  return {
    code: 0,
    signal: null,
  };
}

export function createFailureResult(code = 1) {
  return {
    code,
    signal: null,
  };
}

export function resolveSlidesCommandContext(options = {}) {
  const appRoot = path.resolve(options.appRoot ?? process.cwd());
  const slidesFile = options.slidesFile?.trim() || undefined;

  return {
    appRoot,
    slidesFile,
    slidesSourceFile: resolveSlidesSourceFile(appRoot, slidesFile),
  };
}

export function parseBooleanFlag(value, defaultValue = true) {
  if (value == null || value === "") return defaultValue;
  if (value === "true") return true;
  if (value === "false") return false;

  throw new Error(`Expected a boolean value, received "${value}".`);
}

export function parsePositiveIntegerOption(name, value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Expected ${name} to be a positive integer, received "${value}".`);
  }

  return parsed;
}
