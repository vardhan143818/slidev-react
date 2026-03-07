import { useMemo, type PointerEvent as ReactPointerEvent } from "react";
import type { SlideComponent, SlideMeta } from "../../deck/model/slide";
import { DrawOverlay } from "../draw/DrawOverlay";
import { useDraw } from "../draw/DrawProvider";
import type { PresentationCursorState } from "../presentation/types";
import { resolveSlideSurface, resolveSlideSurfaceClassName } from "./slideSurface";
import { SLIDE_HEIGHT, SLIDE_WIDTH, useSlideScale } from "./slideViewport";
import type { TransitionName } from "../../deck/model/transition";
import { useResolvedLayout } from "../../theme/useResolvedLayout";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function shouldIgnoreStageAdvance(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return !!target.closest('a, button, input, textarea, select, [contenteditable="true"]');
}

function toSlidePoint(
  event: ReactPointerEvent<HTMLElement>,
  offset: { x: number; y: number },
  scale: number,
): PresentationCursorState {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: clamp((event.clientX - rect.left - offset.x) / scale, 0, SLIDE_WIDTH),
    y: clamp((event.clientY - rect.top - offset.y) / scale, 0, SLIDE_HEIGHT),
  };
}

function toViewportPoint(
  point: PresentationCursorState,
  offset: { x: number; y: number },
  scale: number,
) {
  return {
    x: offset.x + point.x * scale,
    y: offset.y + point.y * scale,
  };
}

function toTransitionClassName(transition: TransitionName | undefined) {
  switch (transition) {
    case "slide-left":
      return "slide-transition slide-transition--slide-left";
    case "slide-up":
      return "slide-transition slide-transition--slide-up";
    case "zoom":
      return "slide-transition slide-transition--zoom";
    case "fade":
      return "slide-transition slide-transition--fade";
    default:
      return undefined;
  }
}

function resolveStageContentClassName(transitionClassName: string | undefined) {
  return transitionClassName ? `size-full ${transitionClassName}` : "size-full";
}

export function SlideStage({
  Slide,
  slideId,
  meta,
  deckLayout,
  deckBackground,
  deckTransition,
  remoteCursor,
  onCursorChange,
  onStageAdvance,
  scaleMultiplier = 1,
}: {
  Slide: SlideComponent;
  slideId: string;
  meta: SlideMeta;
  deckLayout?: SlideMeta["layout"];
  deckBackground?: string;
  deckTransition?: TransitionName;
  remoteCursor?: PresentationCursorState | null;
  onCursorChange?: (cursor: PresentationCursorState | null) => void;
  onStageAdvance?: () => void;
  scaleMultiplier?: number;
}) {
  const Layout = useResolvedLayout(meta.layout ?? deckLayout);
  const draw = useDraw();
  const { viewportRef, scale, offset } = useSlideScale(scaleMultiplier);
  const surface = resolveSlideSurface({
    meta,
    deckBackground,
    className: resolveSlideSurfaceClassName({
      layout: meta.layout ?? deckLayout,
      shadowClass: "shadow-[0_20px_60px_rgba(21,42,82,0.12)]",
    }),
  });
  const viewportStageStyle = useMemo(
    () => ({
      width: `${SLIDE_WIDTH}px`,
      height: `${SLIDE_HEIGHT}px`,
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
      transformOrigin: "top left",
    }),
    [offset.x, offset.y, scale],
  );
  const transitionClassName = toTransitionClassName(meta.transition ?? deckTransition);
  const stageContentClassName = resolveStageContentClassName(transitionClassName);
  const remoteCursorPosition = useMemo(() => {
    if (!remoteCursor) return null;

    return toViewportPoint(remoteCursor, offset, scale);
  }, [offset, remoteCursor, scale]);

  return (
    <main
      ref={viewportRef}
      className="relative size-full min-h-0 min-w-0 overflow-hidden p-0"
      onPointerMove={(event) => {
        if (!onCursorChange) return;

        onCursorChange(toSlidePoint(event, offset, scale));
      }}
      onPointerLeave={() => {
        onCursorChange?.(null);
      }}
      onClick={(event) => {
        if (!onStageAdvance || draw.enabled) return;

        if (shouldIgnoreStageAdvance(event.target)) return;

        onStageAdvance();
      }}
    >
      <div style={viewportStageStyle}>
        <article
          key={`${slideId}:${meta.transition ?? deckTransition ?? "none"}`}
          className={surface.className}
          style={surface.style}
        >
          <div className={stageContentClassName}>
            <Layout>
              <Slide />
            </Layout>
            <DrawOverlay slideId={slideId} scale={scale} />
          </div>
        </article>
      </div>
      {remoteCursorPosition && (
        <span
          aria-hidden
          className="pointer-events-none absolute z-30 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rose-500 bg-rose-300/40 shadow-[0_0_0_3px_rgba(244,63,94,0.15)]"
          style={{
            left: `${remoteCursorPosition.x}px`,
            top: `${remoteCursorPosition.y}px`,
          }}
        />
      )}
    </main>
  );
}
