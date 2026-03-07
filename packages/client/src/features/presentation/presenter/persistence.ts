import { z } from "zod";
import type { PresenterCursorMode } from "./usePresenterChromeRuntime";

export const PRESENTER_STAGE_SCALE_STORAGE_KEY = "slide-react:presenter-stage-scale";
export const PRESENTER_CURSOR_MODE_STORAGE_KEY = "slide-react:presenter-cursor-mode";
export const PRESENTER_SIDEBAR_WIDTH_STORAGE_KEY = "slide-react:presenter-sidebar-width";

const presenterStageScaleSchema = z.union([z.literal(0.9), z.literal(1), z.literal(1.08)]);
const presenterCursorModeSchema = z.enum(["always", "idle-hide"]);
const presenterSidebarWidthSchema = z.number().finite();

export function parsePersistedPresenterStageScale(raw: string | null) {
  if (!raw) return null;

  const value = Number(raw);
  const result = presenterStageScaleSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parsePersistedPresenterCursorMode(raw: string | null): PresenterCursorMode | null {
  const result = presenterCursorModeSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export function parsePersistedPresenterSidebarWidth(raw: string | null) {
  if (!raw) return null;

  const value = Number(raw);
  const result = presenterSidebarWidthSchema.safeParse(value);
  return result.success ? result.data : null;
}
