export interface CliOptions {
  force: boolean
  yes: boolean
  targetDir?: string
}

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    force: false,
    yes: false,
  }

  for (const arg of argv) {
    if (arg === '--yes' || arg === '-y') {
      options.yes = true
      continue
    }

    if (arg === '--force' || arg === '-f') {
      options.force = true
      continue
    }

    if (!arg.startsWith('-') && !options.targetDir) {
      options.targetDir = arg
      continue
    }

    throw new Error(`Unknown argument "${arg}".`)
  }

  return options
}

export async function resolveTargetDir(
  options: CliOptions,
  promptProjectName: () => Promise<string>,
) {
  if (options.targetDir) return options.targetDir
  if (options.yes) return 'slidev-react-deck'
  return promptProjectName()
}
