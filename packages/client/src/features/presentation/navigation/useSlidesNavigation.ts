import { useSlidesState } from "../../../app/providers/SlidesNavigationProvider";

export function useSlidesNavigation() {
  const slides = useSlidesState();

  return {
    currentIndex: slides.currentIndex,
    total: slides.total,
    next: slides.next,
    prev: slides.prev,
    first: slides.first,
    last: slides.last,
    goTo: slides.goTo,
  };
}
