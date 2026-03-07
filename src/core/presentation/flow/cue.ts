export function normalizeConfiguredCueCount(cues: number | undefined) {
  if (typeof cues !== "number" || !Number.isFinite(cues)) return 0

  return Math.max(Math.floor(cues), 0)
}

export function resolveCueTotal({
  configuredCues,
  detectedCues,
}: {
  configuredCues?: number
  detectedCues?: number
}) {
  return Math.max(
    normalizeConfiguredCueCount(configuredCues),
    normalizeConfiguredCueCount(detectedCues),
  )
}
