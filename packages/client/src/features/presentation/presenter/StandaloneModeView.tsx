import type { PresentationCursorState } from "../types"
import { RevealProvider } from "../reveal/RevealContext"
import { SlideStage } from "../stage/SlideStage"
import type { CompiledSlide, SlidesConfig } from "./types"
import type { PresentationFlowRuntime } from "./usePresentationFlowRuntime"

export function StandaloneModeView({
  currentSlide,
  slidesConfig,
  canControl,
  remoteCursor,
  setLocalCursor,
  flow,
}: {
  currentSlide: CompiledSlide
  slidesConfig: SlidesConfig
  canControl: boolean
  remoteCursor: PresentationCursorState | null
  setLocalCursor: (cursor: PresentationCursorState | null) => void
  flow: PresentationFlowRuntime
}) {
  const CurrentSlide = currentSlide.component

  return (
    <RevealProvider value={flow.revealContextValue}>
      <SlideStage
        Slide={CurrentSlide}
        slideId={currentSlide.id}
        meta={currentSlide.meta}
        slidesConfig={slidesConfig}
        remoteCursor={canControl ? null : remoteCursor}
        onCursorChange={canControl ? setLocalCursor : undefined}
      />
    </RevealProvider>
  )
}
