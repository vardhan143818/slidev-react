import type { SlideAddonDefinition } from "../types"
import {
  Chart,
  BarChart,
  LineChart,
  AreaChart,
  ScatterChart,
  PieChart,
  RadarChart,
  HeatmapChart,
  FunnelChart,
  WordCloudChart,
  GaugeChart,
  TreemapChart,
  WaterfallChart,
} from "./G2Chart"

export const addon: SlideAddonDefinition = {
  id: "g2",
  label: "G2 Charts",
  mdxComponents: {
    Chart,
    BarChart,
    LineChart,
    AreaChart,
    ScatterChart,
    PieChart,
    RadarChart,
    HeatmapChart,
    FunnelChart,
    WordCloudChart,
    GaugeChart,
    TreemapChart,
    WaterfallChart,
  },
}
