import type { LayoutName } from "./layout";
import type { SlideUnit } from "./slide";
import type { TransitionName } from "./transition";
import type { SlidesViewport } from "./viewport";

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
