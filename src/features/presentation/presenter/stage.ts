import type { SlidesViewport } from "@/slides/model/viewport";

export const OVERVIEW_STAGE_WIDTH = 320;

export function resolveOverviewStageMetrics(viewport: SlidesViewport) {
  const stageWidth = viewport.width;
  const stageHeight = viewport.height;

  return {
    stageWidth,
    stageHeight,
    overviewStageHeight: Math.round((OVERVIEW_STAGE_WIDTH * stageHeight) / stageWidth),
    overviewStageScale: OVERVIEW_STAGE_WIDTH / stageWidth,
  };
}
