import { useSlides } from "../../../app/providers/SlidesProvider";

export function useSlidesNavigation() {
  const slides = useSlides();

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
