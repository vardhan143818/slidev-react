import type { LayoutName } from "@slidev-react/node/slides/model/layout";
import type { SlideComponent } from "@slidev-react/node/slides/model/slide";
import type { TransitionName } from "@slidev-react/node/slides/model/transition";

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
