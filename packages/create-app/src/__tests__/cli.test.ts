import { describe, expect, it, vi } from 'vite-plus/test'
import { parseArgs, resolveTargetDir } from '../cli'

describe('create-slidev-react cli', () => {
  it('treats --yes as non-destructive prompt confirmation', () => {
    expect(parseArgs(['demo-deck', '--yes'])).toEqual({
      force: false,
      yes: true,
      targetDir: 'demo-deck',
    })
  })

  it('requires --force for overwriting an existing directory', () => {
    expect(parseArgs(['demo-deck', '--force'])).toEqual({
      force: true,
      yes: false,
      targetDir: 'demo-deck',
    })
  })

  it('uses the default project name when --yes skips the prompt', async () => {
    const promptProjectName = vi.fn(async () => 'ignored')

    await expect(
      resolveTargetDir(
        {
          force: false,
          yes: true,
        },
        promptProjectName,
      ),
    ).resolves.toBe('slidev-react-deck')
    expect(promptProjectName).not.toHaveBeenCalled()
  })
})
