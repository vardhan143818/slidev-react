import type { Plugin } from 'vite'

const VIRTUAL_PRESENTATION_CONFIG = 'virtual:slidev-react/presentation-config'
const RESOLVED_VIRTUAL_PRESENTATION_CONFIG = `\0${VIRTUAL_PRESENTATION_CONFIG}`

function parsePort(value: string | undefined, fallback: number) {
  if (!value) return fallback

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`[slidev-react] Expected PRESENTATION_WS_PORT to be a positive integer, received "${value}".`)
  }

  return parsed
}

function normalizePath(value: string | undefined, fallback: string) {
  const nextValue = value?.trim() || fallback
  if (nextValue.startsWith('/')) return nextValue
  return `/${nextValue}`
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (!value) return fallback

  const normalized = value.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1') return true
  if (normalized === 'false' || normalized === '0') return false

  throw new Error(
    `[slidev-react] Expected PRESENTATION_WS_ENABLED to be true/false/1/0, received "${value}".`,
  )
}

function generatePresentationConfigModuleCode() {
  const relayUrl = process.env.PRESENTATION_WS_URL?.trim() || null
  const relayPort = parsePort(process.env.PRESENTATION_WS_PORT, 4860)
  const relayPath = normalizePath(process.env.PRESENTATION_WS_PATH, '/ws')
  const relayEnabledByDefault = parseBoolean(
    process.env.PRESENTATION_WS_ENABLED,
    [
      process.env.PRESENTATION_WS_URL,
      process.env.PRESENTATION_WS_PORT,
      process.env.PRESENTATION_WS_PATH,
    ].some((value) => value?.trim()),
  )

  return [
    'const presentationConfig = {',
    '  relay: {',
    `    enabledByDefault: ${JSON.stringify(relayEnabledByDefault)},`,
    `    url: ${JSON.stringify(relayUrl)},`,
    `    port: ${JSON.stringify(relayPort)},`,
    `    path: ${JSON.stringify(relayPath)},`,
    '  },',
    '}',
    '',
    'export default presentationConfig',
    '',
  ].join('\n')
}

export function pluginPresentationConfigModule(): Plugin {
  return {
    name: 'slidev-react:presentation-config',
    enforce: 'pre',

    resolveId(id) {
      if (id === VIRTUAL_PRESENTATION_CONFIG) return RESOLVED_VIRTUAL_PRESENTATION_CONFIG
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_PRESENTATION_CONFIG) return
      return generatePresentationConfigModuleCode()
    },
  }
}
