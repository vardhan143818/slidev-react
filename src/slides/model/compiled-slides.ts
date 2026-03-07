import type { SlidesMeta } from "./slides";
import type { SlideComponent, SlideMeta } from "./slide";

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
