import {
  normalizeConfiguredCueCount,
  resolveCueTotal,
} from "../../core/presentation/flow/cue"

export function normalizeConfiguredClicks(clicks: number | undefined) {
  return normalizeConfiguredCueCount(clicks)
}

export function resolveRevealTotal({
  configuredClicks,
  detectedClicks,
}: {
  configuredClicks?: number
  detectedClicks?: number
}) {
  return resolveCueTotal({
    configuredCues: configuredClicks,
    detectedCues: detectedClicks,
  })
}
