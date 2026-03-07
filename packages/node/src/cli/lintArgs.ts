export interface LintCliArgs {
  slidesFile?: string;
  strict: boolean;
}

export function parseLintArgs(argv: string[]): LintCliArgs {
  let slidesFile;
  let strict = false;

  for (let index = 0; index < argv.length; index += 1) {
    const entry = argv[index];
    if (entry === "--strict") {
      strict = true;
      continue;
    }

    if (entry === "--file" && argv[index + 1]) {
      slidesFile = argv[index + 1];
      index += 1;
      continue;
    }

    if (entry.startsWith("--file=")) {
      slidesFile = entry.slice("--file=".length);
      continue;
    }

    if (!entry.startsWith("--")) {
      slidesFile = entry;
      continue;
    }

    throw new Error(`Unknown lint option "${entry}".`);
  }

  return {
    slidesFile,
    strict,
  };
}
