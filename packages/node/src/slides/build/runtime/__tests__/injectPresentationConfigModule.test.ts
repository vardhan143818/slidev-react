import { afterEach, describe, expect, it } from 'vite-plus/test'
import { pluginPresentationConfigModule } from '../injectPresentationConfigModule'

const ENV_KEYS = [
  'PRESENTATION_WS_ENABLED',
  'PRESENTATION_WS_URL',
  'PRESENTATION_WS_PORT',
  'PRESENTATION_WS_PATH',
] as const

function loadVirtualModule() {
  const plugin = pluginPresentationConfigModule()
  const resolvedId = plugin.resolveId?.('virtual:slidev-react/presentation-config')
  if (typeof resolvedId !== 'string') {
    throw new Error('Failed to resolve presentation config virtual module.')
  }

  const code = plugin.load?.(resolvedId)
  if (typeof code !== 'string') {
    throw new Error('Failed to load presentation config virtual module.')
  }

  return code
}

afterEach(() => {
  for (const key of ENV_KEYS) {
    delete process.env[key]
  }
})

describe('pluginPresentationConfigModule', () => {
  it('keeps relay disabled by default', () => {
    expect(loadVirtualModule()).toContain('enabledByDefault: false')
  })

  it('enables relay when explicitly configured', () => {
    process.env.PRESENTATION_WS_ENABLED = 'true'

    expect(loadVirtualModule()).toContain('enabledByDefault: true')
  })
})
