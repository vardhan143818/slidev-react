#!/usr/bin/env node

import { Command, CommanderError } from "@commander-js/extra-typings";
import { runSlidesBuild, runSlidesDev, runSlidesExport, runSlidesLint } from "@slidev-react/node";

interface CommandResult {
  code: number;
  signal: NodeJS.Signals | null;
}

interface ParsedCommandArgs {
  slidesFile?: string;
  forwardedArgs: string[];
}

type CommandRunner = (argv: string[]) => Promise<void>;

const HELP_TEXT = `
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
`;

function fail(message: string): never {
  console.error(`[slidev-react] ${message}`);
  process.exit(1);
}

function parseCommandArgs(argv: string[]): ParsedCommandArgs {
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

function exitWithCommandResult(result: CommandResult) {
  if (result.signal) {
    process.kill(process.pid, result.signal);
    return;
  }

  process.exit(result.code);
}

async function runWithViteArgs(
  argv: string[],
  runner: (options: {
    appRoot: string;
    slidesFile?: string;
    viteArgs: string[];
  }) => Promise<CommandResult>,
) {
  const { slidesFile, forwardedArgs } = parseCommandArgs(argv);
  const result = await runner({
    appRoot: process.cwd(),
    slidesFile,
    viteArgs: forwardedArgs,
  });

  exitWithCommandResult(result);
}

async function runWithCliArgs(
  argv: string[],
  runner: (options: {
    appRoot: string;
    slidesFile?: string;
    cliArgs: string[];
  }) => Promise<CommandResult>,
) {
  const { slidesFile, forwardedArgs } = parseCommandArgs(argv);
  const result = await runner({
    appRoot: process.cwd(),
    slidesFile,
    cliArgs: forwardedArgs,
  });

  exitWithCommandResult(result);
}

function createPassThroughCommand(
  program: Command,
  name: string,
  description: string,
  runner: CommandRunner,
) {
  program
    .command(name)
    .description(description)
    .argument("[file]")
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .action(async (_file, _options, command) => {
      await runner(command.args);
    });
}

const program = new Command()
  .name("slidev-react")
  .description("CLI entrypoint for slidev-react authoring and build workflows")
  .usage("<command> [file] [options...]")
  .showHelpAfterError()
  .showSuggestionAfterError()
  .addHelpText("after", HELP_TEXT)
  .exitOverride();

createPassThroughCommand(
  program,
  "dev",
  "Start the Vite dev server for a slides source file",
  (argv) => runWithViteArgs(argv, runSlidesDev),
);

createPassThroughCommand(
  program,
  "build",
  "Build the current slides app for production",
  (argv) => runWithViteArgs(argv, runSlidesBuild),
);

createPassThroughCommand(
  program,
  "export",
  "Export PDF / PNG artifacts through Playwright",
  (argv) => runWithCliArgs(argv, runSlidesExport),
);

createPassThroughCommand(
  program,
  "lint",
  "Validate slides authoring warnings",
  (argv) => runWithCliArgs(argv, runSlidesLint),
);

try {
  await program.parseAsync(process.argv);
} catch (error) {
  if (error instanceof CommanderError) {
    if (error.code === "commander.helpDisplayed") {
      process.exit(0);
    }

    process.exit(error.exitCode);
  }

  fail(error instanceof Error ? error.message : String(error));
}
