import type { G2Spec } from '@antv/g2'

/**
 * Named presets that expand into partial G2Spec configurations.
 * Use via `<Chart preset="pie" />` or in semantic components.
 */
export type PresetName = keyof typeof chartPresets

/* eslint-disable @typescript-eslint/consistent-type-assertions */
export const chartPresets = {
  // --- Basic marks ---
  bar:        { type: 'interval' } as Partial<G2Spec>,
  column:     { type: 'interval', coordinate: { transform: [{ type: 'transpose' }] } } as Partial<G2Spec>,
  line:       { type: 'line' } as Partial<G2Spec>,
  area:       { type: 'area' } as Partial<G2Spec>,
  scatter:    { type: 'point' } as Partial<G2Spec>,

  // --- Polar / radial ---
  pie:        { type: 'interval', coordinate: { type: 'theta' }, style: { stroke: '#fff', lineWidth: 1 } } as Partial<G2Spec>,
  donut:      { type: 'interval', coordinate: { type: 'theta' }, style: { stroke: '#fff', lineWidth: 1, innerRadius: 0.6 } } as Partial<G2Spec>,
  rose:       { type: 'interval', coordinate: { type: 'polar' } } as Partial<G2Spec>,
  radar:      { type: 'line', coordinate: { type: 'polar' } } as Partial<G2Spec>,
  radial:     { type: 'interval', coordinate: { type: 'radial' } } as Partial<G2Spec>,

  // --- Statistical ---
  histogram:  { type: 'rect', transform: [{ type: 'binX', y: 'count' }] } as Partial<G2Spec>,
  heatmap:    { type: 'cell' } as Partial<G2Spec>,

  // --- Hierarchy / relational ---
  treemap:    { type: 'treemap' } as Partial<G2Spec>,
  sunburst:   { type: 'sunburst' } as Partial<G2Spec>,
  sankey:     { type: 'sankey' } as Partial<G2Spec>,
  wordcloud:  { type: 'wordCloud' } as Partial<G2Spec>,

  // --- Indicator (registered via plotlib) ---
  gauge:      { type: 'gauge' } as Partial<G2Spec>,
  liquid:     { type: 'liquid' } as Partial<G2Spec>,

  // --- Composite ---
  funnel:     { type: 'interval', coordinate: { transform: [{ type: 'transpose' }] } } as Partial<G2Spec>,
  waterfall:  { type: 'interval', transform: [{ type: 'diffY' }] } as Partial<G2Spec>,
} as const
/* eslint-enable @typescript-eslint/consistent-type-assertions */
