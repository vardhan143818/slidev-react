import { z } from 'zod'

export type PresentationExportMode = 'print'

const presentationExportModeSchema = z.enum(['print'])
const printExportWithClicksSchema = z.union([z.literal('1'), z.literal('true')])

export function resolvePresentationExportMode(search: string): PresentationExportMode | null {
  const result = presentationExportModeSchema.safeParse(new URLSearchParams(search).get('export'))
  return result.success ? result.data : null
}

export function resolvePrintExportWithClicks(search: string) {
  return printExportWithClicksSchema.safeParse(new URLSearchParams(search).get('with-clicks'))
    .success
}

export function buildPrintExportUrl(
  url: string,
  options?: {
    withClicks?: boolean
  },
) {
  const next = new URL(url)
  next.searchParams.set('export', 'print')
  if (options?.withClicks) next.searchParams.set('with-clicks', '1')
  else next.searchParams.delete('with-clicks')
  next.hash = ''
  return next.toString()
}

export function buildSlidesUrl(url: string) {
  const next = new URL(url)
  next.searchParams.delete('export')
  next.hash = ''
  return next.toString()
}
