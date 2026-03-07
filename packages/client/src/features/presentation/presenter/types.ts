import type { LayoutName } from "@slidev-react/core/slides/layout";
import type { SlideComponent } from "@slidev-react/core/slides/slide";
import type { TransitionName } from "@slidev-react/core/slides/transition";

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
