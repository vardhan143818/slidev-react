import type { LayoutName } from "@slidev-react/core/slides/layout";
import type { SlidesViewport } from "@slidev-react/core/slides/viewport";
import type { CompiledSlide } from "./types";
import { ChromePanel, chromePanelClassName } from "../../../ui/primitives/ChromePanel";
import { ChromeTag } from "../../../ui/primitives/ChromeTag";
import { SlidePreviewSurface } from "../stage/SlidePreviewSurface";

export function PresenterSidePreview({
  title,
  indexLabel,
  slide,
  slidesViewport,
  slidesLayout,
  slidesBackground,
}: {
  title: string;
  indexLabel: string;
  slide: CompiledSlide | null;
  slidesViewport: SlidesViewport;
  slidesLayout?: LayoutName;
  slidesBackground?: string;
}) {
  if (!slide) {
    return (
      <ChromePanel className="flex h-full min-h-0 min-w-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            {title}
          </p>
          <ChromeTag tone="active" weight="semibold">
            {indexLabel}
          </ChromeTag>
        </div>
        <ChromePanel
          as="div"
          tone="dashed"
          radius="frame"
          className="grid min-h-[180px] min-w-0 w-full flex-1 place-items-center overflow-hidden text-sm"
        >
          End of slides
        </ChromePanel>
      </ChromePanel>
    );
  }

  return (
    <ChromePanel className="flex h-full min-h-0 min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
          {title}
        </p>
        <ChromeTag tone="active" weight="semibold">
          {indexLabel}
        </ChromeTag>
      </div>
      <SlidePreviewSurface
        Slide={slide.component}
        meta={slide.meta}
        slidesViewport={slidesViewport}
        slidesLayout={slidesLayout}
        slidesBackground={slidesBackground}
        alignment="top-left"
        viewportClassName={chromePanelClassName({
          tone: "frame",
          radius: "frame",
          padding: "none",
          className: "relative min-h-[180px] min-w-0 w-full flex-1 overflow-hidden",
        })}
        stageClassName="text-black"
      />
      <p className="shrink-0 truncate text-base font-semibold text-slate-900">
        {slide.meta.title ?? "Untitled"}
      </p>
    </ChromePanel>
  );
}
