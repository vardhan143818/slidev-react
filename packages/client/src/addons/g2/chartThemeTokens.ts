import type { G2Theme } from '@antv/g2/esm/runtime/types/theme'

// ---------------------------------------------------------------------------
// Color palettes
// ---------------------------------------------------------------------------

/** 10-color categorical palette for series / groups */
export const categoryPalette = [
  '#60a5fa', // blue
  '#34d399', // emerald
  '#a78bfa', // violet
  '#f472b6', // pink
  '#fbbf24', // amber
  '#f87171', // red
  '#22d3ee', // cyan
  '#fb923c', // orange
  '#818cf8', // indigo
  '#2dd4bf', // teal
]

/** Sequential palette for heatmaps / density (light → dark green) */
export const sequentialPalette = [
  '#dcfce7', '#86efac', '#4ade80', '#22c55e', '#15803d', '#052e16',
]

/** Diverging palette for positive/negative deviation */
export const divergingPalette = [
  '#ef4444', '#fca5a5', '#fefce8', '#86efac', '#22c55e',
]

/** Semantic colors for business meaning */
export const semanticColors = {
  positive: '#22c55e',
  negative: '#ef4444',
  warning:  '#f59e0b',
  neutral:  '#94a3b8',
}

// ---------------------------------------------------------------------------
// Resolve CSS variables at runtime
// ---------------------------------------------------------------------------

function resolveVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export function resolveChartFont(): string {
  return resolveVar(
    '--font-sans',
    'Inter, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  )
}

// ---------------------------------------------------------------------------
// Build G2 theme
// ---------------------------------------------------------------------------

export function buildSlidevTheme(): G2Theme {
  const font = resolveChartFont()
  const textColor = resolveVar('--slide-color-body', '#0f172a')
  const mutedColor = resolveVar('--slide-color-muted', '#475569')
  const accent = '#22c55e'

  return {
    color: accent,
    category10: categoryPalette,
    category20: categoryPalette,
    axis: {
      labelFontSize: 12,
      labelFill: '#8b95a2',
      labelFontFamily: font,
      titleFontSize: 13,
      titleFill: '#718096',
      titleFontFamily: font,
      titleFontWeight: 'normal',
      gridStroke: '#e8ecf1',
      gridStrokeOpacity: 0.6,
      lineStroke: '#dfe4ea',
      lineLineWidth: 1,
      tickStroke: '#dfe4ea',
    },
    legendCategory: {
      itemLabelFontSize: 13,
      itemLabelFill: mutedColor,
      itemLabelFontFamily: font,
      titleFontSize: 14,
      titleFill: textColor,
      titleFontFamily: font,
      titleFontWeight: 'bold',
    },
    title: {
      titleFontSize: 18,
      titleFill: textColor,
      titleFontFamily: font,
      titleFontWeight: 'bold',
      subtitleFontSize: 14,
      subtitleFill: mutedColor,
      subtitleFontFamily: font,
    },
    label: {
      fontSize: 12,
      fontFamily: font,
      fill: mutedColor,
    },
  }
}


// ---------------------------------------------------------------------------
// Default sizes
// ---------------------------------------------------------------------------

export type ChartSize = 'full' | 'wide' | 'half' | 'compact' | 'mini'

export const sizePresets: Record<ChartSize, { width: number; height: number }> = {
  full:    { width: 1280, height: 600 },
  wide:    { width: 1280, height: 500 },
  half:    { width: 600,  height: 400 },
  compact: { width: 400,  height: 300 },
  mini:    { width: 200,  height: 80 },
}

