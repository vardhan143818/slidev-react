import type { G2Theme } from "@antv/g2/esm/runtime/types/theme";
import type { SlideThemeTokens } from "../../../theme/types";

export function resolveChartFont(tokens: SlideThemeTokens): string {
  return tokens.fonts.sans;
}

export function resolveCategoryPalette(tokens: SlideThemeTokens) {
  return [
    ...tokens.chart.categorical,
    tokens.chart.accent,
    tokens.chart.warning,
    tokens.chart.neutral,
    tokens.ui.muted,
  ];
}

export function resolveSequentialPalette(tokens: SlideThemeTokens) {
  return [
    tokens.diagram.surface,
    tokens.chart.categorical[1],
    tokens.chart.positive,
    tokens.chart.accent,
    tokens.chart.categorical[5],
    tokens.chart.negative,
  ];
}

export function resolveHeatmapPalette(tokens: SlideThemeTokens) {
  return [
    tokens.diagram.surface,
    tokens.ui.accentSoft,
    tokens.chart.categorical[1],
    tokens.chart.accent,
    tokens.ui.accentStrong,
  ];
}

export function resolveDivergingPalette(tokens: SlideThemeTokens) {
  return [
    tokens.chart.negative,
    tokens.chart.categorical[3],
    tokens.diagram.surface,
    tokens.chart.categorical[1],
    tokens.chart.positive,
  ];
}

export function resolveSemanticColors(tokens: SlideThemeTokens) {
  return {
    positive: tokens.chart.positive,
    negative: tokens.chart.negative,
    warning: tokens.chart.warning,
    neutral: tokens.chart.neutral,
  };
}

export function buildSlideTheme(tokens: SlideThemeTokens): G2Theme {
  const font = resolveChartFont(tokens);
  const categoryPalette = resolveCategoryPalette(tokens);
  const semanticColors = resolveSemanticColors(tokens);

  return {
    color: tokens.chart.accent,
    category10: categoryPalette,
    category20: [...categoryPalette, ...categoryPalette],
    axis: {
      labelFontSize: 12,
      labelFill: tokens.ui.muted,
      labelFontFamily: font,
      titleFontSize: 13,
      titleFill: tokens.ui.muted,
      titleFontFamily: font,
      titleFontWeight: "normal",
      gridStroke: tokens.chart.grid,
      gridStrokeOpacity: 0.6,
      lineStroke: tokens.chart.axis,
      lineLineWidth: 1,
      tickStroke: tokens.chart.axis,
    },
    legendCategory: {
      itemLabelFontSize: 13,
      itemLabelFill: tokens.ui.muted,
      itemLabelFontFamily: font,
      titleFontSize: 14,
      titleFill: tokens.ui.text,
      titleFontFamily: font,
      titleFontWeight: "bold",
    },
    title: {
      titleFontSize: 18,
      titleFill: tokens.ui.text,
      titleFontFamily: font,
      titleFontWeight: "bold",
      subtitleFontSize: 14,
      subtitleFill: tokens.ui.muted,
      subtitleFontFamily: font,
    },
    label: {
      fontSize: 12,
      fontFamily: font,
      fill: tokens.ui.muted,
    },
    point: {
      fillOpacity: 0.92,
    },
    interval: {
      fillOpacity: 0.94,
    },
    area: {
      fillOpacity: 0.72,
    },
    line: {
      lineWidth: 2.5,
    },
    annotationBadge: {
      backgroundFill: semanticColors.neutral,
      textFill: "#ffffff",
    },
  };
}

export type ChartSize = "full" | "wide" | "half" | "compact" | "mini";

export const sizePresets: Record<ChartSize, { width: number; height: number }> = {
  full: { width: 1280, height: 600 },
  wide: { width: 1280, height: 500 },
  half: { width: 600, height: 400 },
  compact: { width: 400, height: 300 },
  mini: { width: 200, height: 80 },
};
