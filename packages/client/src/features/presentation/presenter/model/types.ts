import type { LayoutName } from "@slidev-react/core/slides/layout";
import type { SlideComponent } from "@slidev-react/core/slides/slide";
import type { SlidesViewport } from "@slidev-react/core/slides/viewport";
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

/**
 * Deck-wide visual configuration that flows through the presenter component tree.
 * Groups the repeatedly passed `slides*` props to reduce prop drilling.
 */
export interface SlidesConfig {
  slidesViewport: SlidesViewport;
  slidesLayout?: LayoutName;
  slidesBackground?: string;
  slidesTransition?: TransitionName;
}
