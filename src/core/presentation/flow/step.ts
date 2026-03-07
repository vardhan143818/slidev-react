export function normalizeCueStep(step: number | undefined) {
  if (step === undefined) return undefined
  if (!Number.isFinite(step)) return 1

  return Math.max(1, Math.floor(step))
}
