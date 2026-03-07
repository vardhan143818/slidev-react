import {
  parseSlideSelection,
  type SlideRange,
} from "@slidev-react/core/presentation/export/selection";
import { parsePositiveIntegerOption } from "../context.ts";
import { readOptionValue } from "./readOptionValue.ts";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 4173;
const DEFAULT_OUTPUT_DIR = "output/export";

export interface ExportCliArgs {
  slidesFile?: string;
  format: "all" | "pdf" | "png";
  host: string;
  port: number;
  baseUrl: string;
  withClicks: boolean;
  outputDir: string;
  slideSelection: SlideRange[] | null;
}

export function parseExportArgs(argv: string[]): ExportCliArgs {
  let slidesFile;
  let format: ExportCliArgs["format"] = "all";
  let host = DEFAULT_HOST;
  let port = DEFAULT_PORT;
  let baseUrl;
  let withClicks = false;
  let outputDir = DEFAULT_OUTPUT_DIR;
  let slideSelection = parseSlideSelection(undefined);

  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index];
    if (!entry.startsWith("--")) {
      if (!slidesFile) {
        slidesFile = entry;
        continue;
      }

      throw new Error(`Unknown export argument "${entry}".`);
    }

    if (entry === "--with-clicks") {
      withClicks = true;
      continue;
    }

    if (entry === "--file" || entry.startsWith("--file=")) {
      const result = readOptionValue(argv, index, "--file");
      slidesFile = result.value;
      index = result.nextIndex;
      continue;
    }

    if (entry === "--format" || entry.startsWith("--format=")) {
      const result = readOptionValue(argv, index, "--format");
      if (result.value === "pdf" || result.value === "png" || result.value === "all") {
        format = result.value;
      } else {
        throw new Error(`Unknown export format "${result.value}".`);
      }
      index = result.nextIndex;
      continue;
    }

    if (entry === "--host" || entry.startsWith("--host=")) {
      const result = readOptionValue(argv, index, "--host");
      host = result.value;
      index = result.nextIndex;
      continue;
    }

    if (entry === "--port" || entry.startsWith("--port=")) {
      const result = readOptionValue(argv, index, "--port");
      port = parsePositiveIntegerOption("--port", result.value);
      index = result.nextIndex;
      continue;
    }

    if (entry === "--base-url" || entry.startsWith("--base-url=")) {
      const result = readOptionValue(argv, index, "--base-url");
      baseUrl = result.value;
      index = result.nextIndex;
      continue;
    }

    if (entry === "--output" || entry.startsWith("--output=")) {
      const result = readOptionValue(argv, index, "--output");
      outputDir = result.value;
      index = result.nextIndex;
      continue;
    }

    if (entry === "--slides" || entry.startsWith("--slides=")) {
      const result = readOptionValue(argv, index, "--slides");
      slideSelection = parseSlideSelection(result.value);
      index = result.nextIndex;
      continue;
    }

    throw new Error(`Unknown export option "${entry}".`);
  }

  return {
    slidesFile,
    format,
    host,
    port,
    baseUrl: baseUrl || `http://${host}:${port}`,
    withClicks,
    outputDir,
    slideSelection,
  };
}
