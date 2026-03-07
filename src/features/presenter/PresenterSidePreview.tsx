import { useMemo } from "react";
import type { LayoutName } from "../../deck/model/layout";
import { resolveSlideSurface, resolveSlideSurfaceClassName } from "../player/slideSurface";
import { SLIDE_HEIGHT, SLIDE_WIDTH, useSlideScale } from "../player/slideViewport";
import type { CompiledSlide } from "./types";
import { useResolvedLayout } from "../../theme/useResolvedLayout";

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
      <section className="flex h-full min-h-0 flex-col rounded-[8px] border border-slate-200/70 bg-white/72 p-4 text-slate-900 shadow-[0_18px_44px_rgba(148,163,184,0.18)] backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {title}
          </p>
          <span className="rounded-[5px] border border-slate-200 bg-white/88 px-2.5 py-1 text-[11px] font-medium text-slate-500">
            {indexLabel}
          </span>
        </div>
        <div className="grid min-h-[220px] flex-1 place-items-center rounded-[5px] border border-dashed border-slate-200/80 bg-slate-50/75 text-sm text-slate-500">
          End of deck
        </div>
      </section>
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
    <section className="flex h-full min-h-0 flex-col rounded-[8px] border border-slate-200/70 bg-white/72 p-4 text-slate-900 shadow-[0_18px_44px_rgba(148,163,184,0.18)] backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          {title}
        </p>
        <span className="rounded-[5px] border border-slate-200 bg-white/88 px-2.5 py-1 text-[11px] font-medium text-slate-500">
          {indexLabel}
        </span>
      </div>
      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-[5px] border border-slate-200/80 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
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
    </section>
  );
}
