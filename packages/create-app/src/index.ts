#!/usr/bin/env node

import { createInterface } from 'node:readline/promises'
import path from 'node:path'
import process from 'node:process'
import { parseArgs, resolveTargetDir } from './cli'
import { scaffoldProject } from './createApp'

async function promptProjectName() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Please provide a target directory when running without an interactive terminal.')
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    const answer = (await rl.question('Project name: ')).trim()
    return answer || 'slidev-react-deck'
  } finally {
    rl.close()
  }
}

function printNextSteps(targetDir: string, packageManagerHint: string) {
  const absoluteTarget = path.resolve(process.cwd(), targetDir)
  const relativeTarget = path.relative(process.cwd(), absoluteTarget) || '.'
  const displayTarget = path.isAbsolute(targetDir) ? absoluteTarget : relativeTarget

  console.log('')
  console.log('Next steps:')

  if (displayTarget !== '.') {
    console.log(`  cd ${displayTarget}`)
  }

  if (packageManagerHint === 'yarn') {
    console.log('  yarn')
    console.log('  yarn dev')
    return
  }

  if (packageManagerHint === 'bun') {
    console.log('  bun install')
    console.log('  bun run dev')
    return
  }

  console.log(`  ${packageManagerHint} install`)
  console.log(`  ${packageManagerHint} run dev`)
}

async function run() {
  const options = parseArgs(process.argv.slice(2))
  const targetDir = await resolveTargetDir(options, promptProjectName)
  const result = scaffoldProject({
    cwd: process.cwd(),
    targetDir,
    force: options.force,
  })

  console.log('')
  console.log(`Created slidev-react project in ${result.projectRoot}`)
  printNextSteps(targetDir, result.packageManagerHint)
  console.log('')
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[create-slidev-react] ${message}`)
  process.exit(1)
})
