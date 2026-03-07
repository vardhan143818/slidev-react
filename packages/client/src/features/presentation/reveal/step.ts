import { normalizeCueStep } from "@slidev-react/core/presentation/flow/step";

export function normalizeRevealStep(step: number | undefined) {
  return normalizeCueStep(step);
}
