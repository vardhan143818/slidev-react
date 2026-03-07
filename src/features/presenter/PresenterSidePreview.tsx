import type { LayoutName } from "../../deck/model/layout";
import type { CompiledSlide } from "./types";
import { ChromePanel, chromePanelClassName } from "../../ui/primitives/ChromePanel";
import { ChromeTag } from "../../ui/primitives/ChromeTag";
import { SlidePreviewSurface } from "../player/SlidePreviewSurface";

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

  return (
    <ChromePanel className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          {title}
        </p>
        <ChromeTag>{indexLabel}</ChromeTag>
      </div>
      <SlidePreviewSurface
        Slide={slide.component}
        meta={slide.meta}
        deckLayout={deckLayout}
        deckBackground={deckBackground}
        viewportClassName={chromePanelClassName({
          tone: "frame",
          radius: "frame",
          padding: "none",
          className: "relative flex-1 overflow-hidden",
        })}
        stageClassName="text-black"
      />
      <p className="mt-3 truncate text-base font-semibold text-slate-900">
        {slide.meta.title ?? "Untitled"}
      </p>
    </ChromePanel>
  );
}
