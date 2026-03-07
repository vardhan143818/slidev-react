import type { LayoutName } from "./layout.ts";
import type { SlideUnit } from "./slide.ts";
import type { TransitionName } from "./transition.ts";
import type { SlidesViewport } from "./viewport.ts";

export interface SlidesMeta {
  title?: string;
  theme?: string;
  addons?: string[];
  layout?: LayoutName;
  background?: string;
  transition?: TransitionName;
  exportFilename?: string;
  ar: string;
  viewport: SlidesViewport;
}

export interface SlidesDocument {
  meta: SlidesMeta;
  slides: SlideUnit[];
}
