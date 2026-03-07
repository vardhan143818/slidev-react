import { useMemo } from "react";
import { X } from "lucide-react";
import { resolveSlideSurface, resolveSlideSurfaceClassName } from "../player/slideSurface";
import { SLIDE_HEIGHT, SLIDE_WIDTH, useSlideScale } from "../player/slideViewport";
import type { CompiledSlide } from "../presenter/types";
import { resolveLayout } from "../../theme/layouts/resolveLayout";
import { useResolvedLayouts } from "../../theme/useResolvedLayout";

function OverviewSlidePreview({
  index,
  active,
  layoutLabel,
  surface,
  children,
}: {
  index: number;
  active: boolean;
  layoutLabel?: string;
  surface: ReturnType<typeof resolveSlideSurface>;
  children: React.ReactNode;
}) {
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
    <div
      ref={viewportRef}
      className={`relative mb-0 aspect-[16/9] w-full overflow-hidden rounded-t-[9px] rounded-b-none bg-slate-100/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${active ? "ring-1 ring-sky-200/70" : ""}`}
    >
      <span
        className={`absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase backdrop-blur-sm ${active ? "bg-sky-100/92 text-sky-700" : "bg-white/80 text-slate-600"}`}
      >
        {index + 1}
      </span>
      {layoutLabel && (
        <span className="absolute top-2 right-2 z-10 rounded-full bg-white/72 px-2 py-0.5 text-[10px] tracking-[0.12em] text-slate-500 uppercase backdrop-blur-sm">
          {layoutLabel}
        </span>
      )}
      <div className="pointer-events-none select-none" style={viewportStageStyle}>
        <article
          className={surface.className}
          style={{
            ...surface.style,
            width: `${SLIDE_WIDTH}px`,
            height: `${SLIDE_HEIGHT}px`,
          }}
        >
          {children}
        </article>
      </div>
    </div>
  );
}

export function QuickOverview({
  open,
  slides,
  currentIndex,
  deckLayout,
  deckBackground,
  onClose,
  onSelect,
}: {
  open: boolean;
  slides: CompiledSlide[];
  currentIndex: number;
  deckLayout?: CompiledSlide["meta"]["layout"];
  deckBackground?: string;
  onClose: () => void;
  onSelect: (index: number) => void;
}) {
  const layouts = useResolvedLayouts();

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 bg-[linear-gradient(180deg,rgba(241,245,249,0.82)_0%,rgba(248,250,252,0.9)_100%)] backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-[2200px] flex-col px-6 py-6">
        <header className="mb-5 flex items-center justify-between">
          <div className="text-slate-900">
            <h2 className="text-lg font-semibold">Quick Overview</h2>
            <p className="text-sm text-slate-600">
              Click a slide to jump. Press `O` or `Esc` to close.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick overview"
            className="inline-flex size-10 items-center justify-center rounded-full bg-white/78 text-slate-600 shadow-[0_10px_30px_rgba(148,163,184,0.22)] transition hover:bg-white hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto pr-1">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-5">
            {slides.map((slide, index) => {
              const active = index === currentIndex;
              const Layout = resolveLayout(slide.meta.layout, layouts);
              const Slide = slide.component;
              const surface = resolveSlideSurface({
                meta: slide.meta,
                deckBackground,
                className: resolveSlideSurfaceClassName({
                  layout: slide.meta.layout ?? deckLayout,
                }),
              });
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => onSelect(index)}
                  className={`group overflow-hidden rounded-[12px] p-0 text-left transition ${active ? "bg-white/96 shadow-[0_24px_64px_rgba(37,99,235,0.16)] ring-1 ring-sky-300/70" : "bg-white/78 shadow-[0_18px_46px_rgba(148,163,184,0.18)] ring-1 ring-transparent hover:bg-white/92 hover:shadow-[0_26px_68px_rgba(148,163,184,0.24)] hover:ring-slate-300/70"}`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <OverviewSlidePreview
                    index={index}
                    active={active}
                    layoutLabel={slide.meta.layout}
                    surface={surface}
                  >
                    <Layout>
                      <Slide />
                    </Layout>
                  </OverviewSlidePreview>
                  <div className="truncate px-2.5 py-2 text-sm font-medium text-slate-900">
                    {slide.meta.title ?? `Slide ${index + 1}`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
