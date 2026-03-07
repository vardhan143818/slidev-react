import type { LayoutName } from "@/slides/model/layout";
import type { SlideComponent } from "@/slides/model/slide";
import type { TransitionName } from "@/slides/model/transition";

export interface CompiledSlide {
  id: string;
  component: SlideComponent;
  meta: {
    title?: string;
    layout?: LayoutName;
    class?: string;
    background?: string;
    transition?: TransitionName;
    clicks?: number;
    notes?: string;
    src?: string;
  };
}
