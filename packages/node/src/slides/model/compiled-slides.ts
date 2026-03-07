import type { SlidesMeta } from "./slides.ts";
import type { SlideComponent, SlideMeta } from "./slide.ts";

export interface CompiledSlide {
  id: string;
  component: SlideComponent;
  meta: SlideMeta;
}

export interface CompiledSlidesManifest {
  meta: SlidesMeta;
  slides: CompiledSlide[];
  sourceHash: string;
}
