import path from "node:path";
import { resolveSlidesSourceFile } from "./slides/build/config/slidesSourceFile.ts";

export interface CommandResult {
  code: number;
  signal: NodeJS.Signals | null;
}

export interface SlidesCommandOptions {
  appRoot?: string;
  slidesFile?: string;
}

export interface SlidesCommandContext {
  appRoot: string;
  slidesFile?: string;
  slidesSourceFile: string;
}

export function createSuccessResult(): CommandResult {
  return {
    code: 0,
    signal: null,
  };
}

export function createFailureResult(code = 1): CommandResult {
  return {
    code,
    signal: null,
  };
}

export function resolveSlidesCommandContext(
  options: SlidesCommandOptions = {},
): SlidesCommandContext {
  const appRoot = path.resolve(options.appRoot ?? process.cwd());
  const slidesFile = options.slidesFile?.trim() || undefined;

  return {
    appRoot,
    slidesFile,
    slidesSourceFile: resolveSlidesSourceFile(appRoot, slidesFile),
  };
}

export function parseBooleanFlag(value: string | undefined | null, defaultValue = true) {
  if (value == null || value === "") return defaultValue;
  if (value === "true") return true;
  if (value === "false") return false;

  throw new Error(`Expected a boolean value, received "${value}".`);
}

export function parsePositiveIntegerOption(name: string, value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Expected ${name} to be a positive integer, received "${value}".`);
  }

  return parsed;
}
