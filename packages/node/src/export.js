import { mkdir } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "@playwright/test";
import {
  createSlideSnapshotFileName,
  resolveExportSlidesBaseName,
} from "../../client/src/features/presentation/exportArtifacts.ts";
import {
  clampSlideSelection,
  createRangesFromSlides,
  createSlideSelectionLabel,
  expandSlideSelection,
  parseSlideSelection,
  toPdfPageRanges,
} from "../../client/src/features/presentation/exportSelection.ts";
import { buildPrintExportUrl } from "../../client/src/features/presentation/printExport.ts";
import { createSuccessResult, parsePositiveIntegerOption } from "./context.js";
import { startSlidesDevServer, stopSlidesDevServer } from "./dev.js";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 4173;
const DEFAULT_OUTPUT_DIR = "output/export";
const DEV_SERVER_TIMEOUT_MS = 120_000;

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

function parseExportArgs(argv) {
  let slidesFile;
  let format = "all";
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

async function isServerReachable(baseUrl) {
  try {
    const response = await fetch(baseUrl, {
      signal: AbortSignal.timeout(2_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(baseUrl, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await isServerReachable(baseUrl)) return;
    await delay(500);
  }

  throw new Error(`Timed out waiting for ${baseUrl}`);
}

export async function exportSlidesArtifacts(options = {}) {
  const parsedArgs = parseExportArgs(options.cliArgs ?? []);
  const exportOptions = {
    ...parsedArgs,
    slidesFile: options.slidesFile ?? parsedArgs.slidesFile,
  };
  const printUrl = buildPrintExportUrl(exportOptions.baseUrl, {
    withClicks: exportOptions.withClicks,
  });
  const shouldReuseExistingServer = await isServerReachable(exportOptions.baseUrl);
  const devServer = shouldReuseExistingServer
    ? null
    : await startSlidesDevServer({
        appRoot: options.appRoot,
        slidesFile: exportOptions.slidesFile,
        printUrls: false,
        viteArgs: ["--host", exportOptions.host, "--port", String(exportOptions.port)],
      });

  if (devServer) {
    await waitForServer(exportOptions.baseUrl, DEV_SERVER_TIMEOUT_MS);
  }

  try {
    const browser = await chromium.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage({
        viewport: { width: 2400, height: 1600 },
        deviceScaleFactor: 1,
      });

      await page.goto(printUrl, {
        waitUntil: "networkidle",
      });
      await page.waitForSelector('[data-export-view="print"]');
      await page.waitForFunction(
        () =>
          Array.from(document.querySelectorAll('[data-export-slide-ready="false"]')).length === 0,
      );
      const exportViewport = await page.locator('[data-export-view="print"]').evaluate((node) => ({
        width: Number.parseInt(node.getAttribute("data-export-viewport-width") ?? "1920", 10),
        height: Number.parseInt(node.getAttribute("data-export-viewport-height") ?? "1080", 10),
      }));

      const slidesBaseName = resolveExportSlidesBaseName(await page.title());
      const snapshotInfos = await page
        .locator('[data-export-snapshot="slide"]')
        .evaluateAll((nodes) =>
          nodes.map((node, index) => ({
            page: index + 1,
            slideNumber: Number.parseInt(node.getAttribute("data-export-slide") ?? "0", 10),
            title: node.getAttribute("data-export-slide-title") ?? "",
            click: node.getAttribute("data-export-click") ?? "all",
          })),
        );
      const totalSlides = new Set(snapshotInfos.map((info) => info.slideNumber)).size;
      const selectedRanges = clampSlideSelection(exportOptions.slideSelection, totalSlides);
      const selectedSlides = expandSlideSelection(selectedRanges);
      if (selectedSlides.length === 0) {
        throw new Error(`No slides matched --slides for a slides file with ${totalSlides} slides.`);
      }

      const selectedSlideSet = new Set(selectedSlides);
      const selectedSnapshots = snapshotInfos.filter((info) =>
        selectedSlideSet.has(info.slideNumber),
      );
      if (selectedSnapshots.length === 0) {
        throw new Error("No export snapshots matched the requested slides.");
      }

      const selectionLabel =
        selectedRanges.length === 1 &&
        selectedRanges[0].start === 1 &&
        selectedRanges[0].end === totalSlides
          ? null
          : createSlideSelectionLabel(selectedRanges);
      const variantLabel = [selectionLabel, exportOptions.withClicks ? "with-clicks" : null]
        .filter(Boolean)
        .join("-");
      const slidesOutputDir = path.resolve(exportOptions.outputDir, slidesBaseName);
      const pngOutputDir = variantLabel
        ? path.join(slidesOutputDir, "png", variantLabel)
        : path.join(slidesOutputDir, "png");
      await mkdir(slidesOutputDir, { recursive: true });

      const createdFiles = [];

      if (exportOptions.format === "all" || exportOptions.format === "pdf") {
        const pdfPath = path.join(
          slidesOutputDir,
          variantLabel ? `${slidesBaseName}-${variantLabel}.pdf` : `${slidesBaseName}.pdf`,
        );
        await page.emulateMedia({ media: "print" });
        await page.pdf({
          path: pdfPath,
          landscape: exportViewport.width > exportViewport.height,
          printBackground: true,
          preferCSSPageSize: true,
          pageRanges: toPdfPageRanges(
            createRangesFromSlides(selectedSnapshots.map((info) => info.page)),
          ),
        });
        await page.emulateMedia({ media: "screen" });
        createdFiles.push(pdfPath);
      }

      if (exportOptions.format === "all" || exportOptions.format === "png") {
        await mkdir(pngOutputDir, { recursive: true });
        await page.addStyleTag({
          content: `
            .print-slides-view main {
              max-width: none !important;
            }
            .print-slide-shell {
              width: ${exportViewport.width}px !important;
              margin-left: auto !important;
              margin-right: auto !important;
            }
            .print-slide-frame {
              padding: 0 !important;
              border: none !important;
              background: transparent !important;
              box-shadow: none !important;
            }
            .print-slide-frame [data-export-surface="slide"] {
              width: ${exportViewport.width}px !important;
              height: ${exportViewport.height}px !important;
              max-width: none !important;
              min-height: ${exportViewport.height}px !important;
              aspect-ratio: auto !important;
              box-shadow: none !important;
            }
          `,
        });

        for (const snapshot of selectedSnapshots) {
          const shell = page
            .locator(
              `[data-export-snapshot="slide"][data-export-slide="${snapshot.slideNumber}"][data-export-click="${snapshot.click}"]`,
            )
            .first();
          const fileName = createSlideSnapshotFileName({
            index: snapshot.slideNumber,
            title: snapshot.title,
            clickStep:
              exportOptions.withClicks && snapshot.click !== "all"
                ? Number.parseInt(snapshot.click, 10)
                : null,
          });
          const targetPath = path.join(pngOutputDir, fileName);

          await shell.locator('[data-export-surface="slide"]').screenshot({
            path: targetPath,
          });

          createdFiles.push(targetPath);
        }
      }

      return {
        createdFiles,
        selectedSlides,
        variantLabel,
      };
    } finally {
      await browser.close();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Executable doesn't exist|browserType\.launch/i.test(message)) {
      throw new Error(
        `${message}\nRun \`pnpm run test:e2e:install\` first so Playwright can install Chromium.`,
      );
    }

    throw error;
  } finally {
    if (devServer) {
      await stopSlidesDevServer(devServer);
    }
  }
}

export async function runSlidesExport(options = {}) {
  const result = await exportSlidesArtifacts(options);
  console.log("[slide-react] export complete");
  console.log(
    `  slides: ${result.selectedSlides.join(", ")}${result.variantLabel ? ` (${result.variantLabel})` : ""}`,
  );
  for (const file of result.createdFiles) {
    console.log(`  - ${file}`);
  }

  return createSuccessResult();
}
