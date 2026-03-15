import { InsightAddonProvider } from "./InsightAddonProvider";
import { SpotlightLayout } from "./SpotlightLayout";
import { Insight } from "./Insight";
import type { SlideAddonDefinition } from "../types";

export const addon: SlideAddonDefinition = {
  id: "insight",
  label: "Insight",
  experimental: true,
  provider: InsightAddonProvider,
  layoutIds: ["spotlight"],
  layouts: {
    spotlight: SpotlightLayout,
  },
  mdxComponents: {
    Insight,
  },
};
