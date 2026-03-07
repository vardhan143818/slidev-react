import { useMemo } from "react";
import type { LayoutName } from "../../deck/model/layout";
import { resolveSlideSurface, resolveSlideSurfaceClassName } from "../player/slideSurface";
import { SLIDE_HEIGHT, SLIDE_WIDTH, useSlideScale } from "../player/slideViewport";
import type { CompiledSlide } from "./types";
import { useResolvedLayout } from "../../theme/useResolvedLayout";
import { ChromePanel, chromePanelClassName } from "../../ui/primitives/ChromePanel";
import { ChromeTag } from "../../ui/primitives/ChromeTag";

export function PresenterSidePreview({
  title,
  indexLabel,
  slide,
  deckLayout,
  deckBackground,
}: {
  title: string;
  indexLabel: string;
  slide: CompiledSlide | null;
  deckLayout?: LayoutName;
  deckBackground?: string;
}) {
  if (!slide) {
    return (
      <ChromePanel className="flex h-full flex-col">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {title}
          </p>
          <ChromeTag>{indexLabel}</ChromeTag>
        </div>
        <ChromePanel
          as="div"
          tone="dashed"
          radius="frame"
          className="grid min-h-[220px] flex-1 place-items-center text-sm"
        >
          End of deck
        </ChromePanel>
      </ChromePanel>
    );
  }

  const Layout = useResolvedLayout(slide.meta.layout ?? deckLayout);
  const Slide = slide.component;
  const surface = resolveSlideSurface({
    meta: slide.meta,
    deckBackground,
    className: resolveSlideSurfaceClassName({
      layout: slide.meta.layout ?? deckLayout,
    }),
  });
  const { viewportRef, scale, offset } = useSlideScale(1);
  const viewportStageStyle = useMemo(
    () => ({
      width: `${SLIDE_WIDTH}px`,
      height: `${SLIDE_HEIGHT}px`,
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
      transformOrigin: "top left",
    }),
    [offset.x, offset.y, scale],
  );

  return (
    <ChromePanel className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          {title}
        </p>
        <ChromeTag>{indexLabel}</ChromeTag>
      </div>
      <div
        ref={viewportRef}
        className={chromePanelClassName({
          tone: "frame",
          radius: "frame",
          padding: "none",
          className: "relative flex-1 overflow-hidden",
        })}
      >
        <div className="text-black" style={viewportStageStyle}>
          <article
            className={surface.className}
            style={{
              ...surface.style,
              width: `${SLIDE_WIDTH}px`,
              height: `${SLIDE_HEIGHT}px`,
            }}
          >
            <Layout>
              <Slide />
            </Layout>
          </article>
        </div>
      </div>
      <p className="mt-3 truncate text-base font-semibold text-slate-900">
        {slide.meta.title ?? "Untitled"}
      </p>
    </ChromePanel>
  );
}
