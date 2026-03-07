import type { KeyboardEvent } from "react";
import { X } from "lucide-react";
import type { CompiledSlide } from "../presenter/types";
import { ChromeIconButton } from "../../ui/primitives/ChromeIconButton";
import { ChromePanel } from "../../ui/primitives/ChromePanel";
import { ChromeTag } from "../../ui/primitives/ChromeTag";
import { SlidePreviewSurface } from "../player/SlidePreviewSurface";

function OverviewSlidePreview({
  index,
  active,
  slide,
  deckLayout,
  deckBackground,
}: {
  index: number;
  active: boolean;
  slide: CompiledSlide;
  deckLayout?: CompiledSlide["meta"]["layout"];
  deckBackground?: string;
}) {
  return (
    <div
      className={`relative mb-0 aspect-[16/9] w-full overflow-hidden rounded-t-[9px] rounded-b-none bg-slate-100/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${active ? "ring-1 ring-emerald-200/80" : ""}`}
    >
      <span className="absolute top-2 left-2 z-10">
        <ChromeTag tone={active ? "active" : "default"} size="xs" weight="semibold">
          {index + 1}
        </ChromeTag>
      </span>
      {slide.meta.layout && (
        <span className="absolute top-2 right-2 z-10">
          <ChromeTag size="xs">{slide.meta.layout}</ChromeTag>
        </span>
      )}
      <SlidePreviewSurface
        Slide={slide.component}
        meta={slide.meta}
        deckLayout={deckLayout}
        deckBackground={deckBackground}
        viewportClassName="size-full"
        stageClassName="pointer-events-none select-none"
      />
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
  function handleSelectKeyDown(event: KeyboardEvent<HTMLElement>, index: number) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect(index);
  }

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
          <ChromeIconButton
            onClick={onClose}
            aria-label="Close quick overview"
            className="rounded-full shadow-[0_10px_30px_rgba(148,163,184,0.22)]"
          >
            <X size={18} />
          </ChromeIconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-auto pr-1">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-5">
            {slides.map((slide, index) => {
              const active = index === currentIndex;
              return (
                <ChromePanel
                  key={slide.id}
                  as="article"
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(index)}
                  onKeyDown={(event) => handleSelectKeyDown(event, index)}
                  className={`group cursor-pointer overflow-hidden p-0 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-300/70 ${active ? "bg-white/96 shadow-[0_24px_64px_rgba(34,197,94,0.16)] ring-1 ring-emerald-300/70" : "bg-white/78 shadow-[0_18px_46px_rgba(148,163,184,0.18)] ring-1 ring-transparent hover:bg-white/92 hover:shadow-[0_26px_68px_rgba(148,163,184,0.24)] hover:ring-slate-300/70"}`}
                  aria-label={`Go to slide ${index + 1}`}
                  tone="solid"
                  radius="section"
                  padding="none"
                >
                  <OverviewSlidePreview
                    index={index}
                    active={active}
                    slide={slide}
                    deckLayout={deckLayout}
                    deckBackground={deckBackground}
                  />
                  <div className="truncate px-2.5 py-2 text-sm font-medium text-slate-900">
                    {slide.meta.title ?? `Slide ${index + 1}`}
                  </div>
                </ChromePanel>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
