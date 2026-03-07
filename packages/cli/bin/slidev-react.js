#!/usr/bin/env -S node --import tsx

import { runSlidesBuild, runSlidesDev, runSlidesExport, runSlidesLint } from "@slidev-react/node";

function printHelp() {
  console.log(`slidev-react

Usage:
  slidev-react dev [file] [options...]
  slidev-react build [file] [options...]
  slidev-react export [file] [export options...]
  slidev-react lint [file] [lint options...]

Commands:
  dev       Start the Vite dev server for a slides source file
  build     Build the current slides app for production
  export    Export PDF / PNG artifacts through Playwright
  lint      Validate slides authoring warnings

Supported dev options:
  --host, --port, --open, --strictPort, --base, --mode

Supported build options:
  --outDir, --base, --mode, --emptyOutDir, --minify, --sourcemap

Examples:
  slidev-react dev
  slidev-react dev slides-ar-3-4.mdx --host 0.0.0.0 --port 5174
  slidev-react build slides-ar-3-4.mdx
  slidev-react export slides-ar-3-4.mdx --format png --slides 3-7
  slidev-react lint slides-ar-3-4.mdx --strict
`);
}

function fail(message) {
  console.error(`[slidev-react] ${message}`);
  process.exit(1);
}

function parseCommandArgs(argv) {
  const args = [...argv];
  let slidesFile;

  if (args[0] && !args[0].startsWith("-")) {
    slidesFile = args.shift();
  }

  for (let index = 0; index < args.length; index += 1) {
    const entry = args[index];
    if (entry === "--file" && args[index + 1]) {
      slidesFile = args[index + 1];
      args.splice(index, 2);
      index -= 1;
      continue;
    }

    if (entry.startsWith("--file=")) {
      slidesFile = entry.slice("--file=".length);
      args.splice(index, 1);
      index -= 1;
    }
  }

  return {
    slidesFile,
    forwardedArgs: args,
  };
}

function exitWithCommandResult(result) {
  if (result.signal) {
    process.kill(process.pid, result.signal);
    return;
  }

  process.exit(result.code);
}

async function runDev(argv) {
  const { slidesFile, forwardedArgs } = parseCommandArgs(argv);
  const result = await runSlidesDev({
    appRoot: process.cwd(),
    slidesFile,
    viteArgs: forwardedArgs,
  });
  exitWithCommandResult(result);
}

async function runBuild(argv) {
  const { slidesFile, forwardedArgs } = parseCommandArgs(argv);
  const result = await runSlidesBuild({
    appRoot: process.cwd(),
    slidesFile,
    viteArgs: forwardedArgs,
  });
  exitWithCommandResult(result);
}

async function runExport(argv) {
  const { slidesFile, forwardedArgs } = parseCommandArgs(argv);
  const result = await runSlidesExport({
    appRoot: process.cwd(),
    slidesFile,
    cliArgs: forwardedArgs,
  });
  exitWithCommandResult(result);
}

async function runLint(argv) {
  const { slidesFile, forwardedArgs } = parseCommandArgs(argv);
  const result = await runSlidesLint({
    appRoot: process.cwd(),
    slidesFile,
    cliArgs: forwardedArgs,
  });
  exitWithCommandResult(result);
}

const rawArgs = process.argv.slice(2);
const normalizedArgs = rawArgs[0] === "--" ? rawArgs.slice(1) : rawArgs;
const [command, ...commandArgs] = normalizedArgs;

if (!command || command === "help" || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

try {
  if (command === "dev") {
    await runDev(commandArgs);
  } else if (command === "build") {
    await runBuild(commandArgs);
  } else if (command === "export") {
    await runExport(commandArgs);
  } else if (command === "lint") {
    await runLint(commandArgs);
  } else {
    fail(`Unknown command "${command}". Run \`slidev-react --help\` for usage.`);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
