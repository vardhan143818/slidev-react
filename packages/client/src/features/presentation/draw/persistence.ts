import { z } from "zod";
import type { PresentationDrawingsState } from "../types";

export const DRAW_STORAGE_VERSION = 1;

export interface PersistedDrawState {
  version: typeof DRAW_STORAGE_VERSION;
  strokesBySlideId: PresentationDrawingsState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const drawPointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const drawStrokeSchema = z.object({
  id: z.string(),
  color: z.string(),
  width: z.number(),
  kind: z.enum(["pen", "circle", "rectangle"]).optional(),
  points: z.array(drawPointSchema),
});

const drawingsStateSchema = z.record(z.string(), z.array(drawStrokeSchema));

export function parsePersistedDrawState(raw: string): PersistedDrawState | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.version !== DRAW_STORAGE_VERSION) return null;

    const result = drawingsStateSchema.safeParse(parsed.strokesBySlideId);
    if (!result.success) return null;

    return {
      version: DRAW_STORAGE_VERSION,
      strokesBySlideId: result.data,
    };
  } catch {
    return null;
  }
}

export function createPersistedDrawState(
  strokesBySlideId: PresentationDrawingsState,
): PersistedDrawState {
  return {
    version: DRAW_STORAGE_VERSION,
    strokesBySlideId,
  };
}
