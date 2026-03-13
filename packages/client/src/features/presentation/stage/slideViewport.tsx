import { useEffect, useRef, useState } from "react";
import type { SlidesViewport } from "@slidev-react/core/slides/viewport";

type SlideScaleAlignment = "center" | "top-left";

export function useSlideScale(
  scaleMultiplier: number,
  alignment: SlideScaleAlignment = "center",
  viewport: SlidesViewport,
) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = viewportRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const updateScale = () => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;

      const nextScale =
        Math.min(width / viewport.width, height / viewport.height) * scaleMultiplier;
      const scaledWidth = viewport.width * nextScale;
      const scaledHeight = viewport.height * nextScale;

      setScale(nextScale);
      setOffset({
        x: alignment === "top-left" ? 0 : (width - scaledWidth) / 2,
        y: alignment === "top-left" ? 0 : (height - scaledHeight) / 2,
      });
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [alignment, scaleMultiplier, viewport.height, viewport.width]);

  return { viewportRef, scale, offset };
}

