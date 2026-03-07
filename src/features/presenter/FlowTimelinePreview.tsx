import { X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { LayoutName } from "../../deck/model/layout"
import { resolveSlideSurface, resolveSlideSurfaceClassName } from "../player/slideSurface"
import { RevealProvider, type RevealContextValue } from "../reveal/RevealContext"
import { useResolvedLayout } from "../../theme/useResolvedLayout"
import { OVERVIEW_STAGE_SCALE, STAGE_HEIGHT, STAGE_WIDTH } from "./stage"
import type { CompiledSlide } from "./types"

type FlowPreviewMode = "live" | "steps" | "final"

function noopCleanup() {}

function noopRegisterStep() {
  return noopCleanup
}

function createRevealContextValue({
  slideId,
  clicks,
  clicksTotal,
}: {
  slideId: string
  clicks: number
  clicksTotal: number
}): RevealContextValue {
  return {
    slideId,
    clicks,
    clicksTotal,
    setClicks: () => {},
    registerStep: noopRegisterStep,
    advance: () => {},
    retreat: () => {},
    canAdvance: clicks < clicksTotal,
    canRetreat: clicks > 0,
  }
}

function resolvePreviewStep({
  mode,
  currentClicks,
  currentClicksTotal,
  selectedClicks,
}: {
  mode: FlowPreviewMode
  currentClicks: number
  currentClicksTotal: number
  selectedClicks: number
}) {
  if (mode === "final") return currentClicksTotal
  if (mode === "steps") return selectedClicks

  return currentClicks
}

function describePreviewStep(step: number, total: number) {
  if (total <= 0) return "Base state"
  if (step <= 0) return "Before cue 1"
  if (step >= total) return `Cue ${total}/${total} • final state`

  return `Cue ${step}/${total}`
}

export function FlowTimelinePreview({
  slide,
  currentClicks,
  currentClicksTotal,
  deckLayout,
  deckBackground,
  onJumpToCue,
  onClose,
  className,
}: {
  slide: CompiledSlide
  currentClicks: number
  currentClicksTotal: number
  deckLayout?: LayoutName
  deckBackground?: string
  onJumpToCue?: (cueIndex: number) => void
  onClose?: () => void
  className?: string
}) {
  const [mode, setMode] = useState<FlowPreviewMode>("live")
  const [selectedClicks, setSelectedClicks] = useState(currentClicks)
  const Layout = useResolvedLayout(slide.meta.layout ?? deckLayout)
  const Slide = slide.component
  const cueSteps = useMemo(
    () => Array.from({ length: currentClicksTotal + 1 }, (_, index) => index),
    [currentClicksTotal],
  )

  useEffect(() => {
    setSelectedClicks(currentClicks)
  }, [currentClicks, currentClicksTotal, slide.id])

  const previewClicks = resolvePreviewStep({
    mode,
    currentClicks,
    currentClicksTotal,
    selectedClicks,
  })
  const revealContextValue = useMemo(
    () =>
      createRevealContextValue({
        slideId: `${slide.id}:timeline-preview`,
        clicks: previewClicks,
        clicksTotal: currentClicksTotal,
      }),
    [currentClicksTotal, previewClicks, slide.id],
  )
  const surface = resolveSlideSurface({
    meta: slide.meta,
    deckBackground,
    className: resolveSlideSurfaceClassName({
      layout: slide.meta.layout ?? deckLayout,
      overflowHidden: true,
      shadowClass: "shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]",
    }),
  })
  const previewLabel = describePreviewStep(previewClicks, currentClicksTotal)
  const modeDescription =
    mode === "live"
      ? "Mirror the current stage state."
      : mode === "final"
        ? "Flatten to the final result."
        : "Inspect one cue position without changing the stage."

  return (
    <section
      className={`flex min-h-0 flex-col rounded-[8px] border border-slate-200/70 bg-white/72 p-4 text-slate-900 shadow-[0_18px_44px_rgba(148,163,184,0.18)] backdrop-blur-md ${className ?? ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Timeline Preview
          </p>
          <p className="mt-1 text-xs text-slate-500">{modeDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-[5px] border border-slate-200 bg-white/88 px-2.5 py-1 text-[11px] font-medium text-slate-500">
            {previewLabel}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close timeline preview"
              className="inline-flex size-8 items-center justify-center rounded-[5px] border border-slate-200 bg-white/88 text-slate-500 transition hover:bg-white hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="mb-3 flex items-center gap-2 rounded-[6px] border border-slate-200/80 bg-white/80 p-1">
        {(["live", "steps", "final"] as const).map((value) => {
          const active = mode === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`inline-flex flex-1 items-center justify-center rounded-[5px] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                active
                  ? "bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {value}
            </button>
          )
        })}
      </div>
      <div className="mb-3 overflow-hidden rounded-[6px] border border-slate-200/80 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
        <div
          className="origin-top-left"
          style={{
            width: `${STAGE_WIDTH}px`,
            height: `${STAGE_HEIGHT}px`,
            transform: `scale(${OVERVIEW_STAGE_SCALE})`,
            transformOrigin: "top left",
          }}
        >
          <RevealProvider value={revealContextValue}>
            <article className={surface.className} style={surface.style}>
              <Layout>
                <Slide />
              </Layout>
            </article>
          </RevealProvider>
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          Current stage: {currentClicksTotal > 0 ? `${currentClicks}/${currentClicksTotal}` : "base"}
        </span>
        {onJumpToCue && previewClicks !== currentClicks && (
          <button
            type="button"
            onClick={() => onJumpToCue(previewClicks)}
            className="rounded-[5px] border border-sky-200 bg-sky-50 px-2.5 py-1 font-medium text-sky-700 transition hover:bg-sky-100"
          >
            Jump To Stage
          </button>
        )}
      </div>
      {currentClicksTotal > 0 ? (
        <div className="grid grid-cols-2 gap-2 overflow-auto pr-1">
          {cueSteps.map((step) => {
            const selected = previewClicks === step
            const current = currentClicks === step
            const label = step === 0 ? "Start" : `Cue ${step}`

            return (
              <button
                key={step}
                type="button"
                onClick={() => {
                  setMode("steps")
                  setSelectedClicks(step)
                }}
                className={`rounded-[6px] border px-3 py-2 text-left transition ${
                  selected
                    ? "border-slate-900 bg-slate-900 text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)]"
                    : current
                      ? "border-sky-300 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      selected
                        ? "bg-white/18 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    reveal
                  </span>
                </div>
                <div
                  className={`mt-1 text-xs ${
                    selected ? "text-white/78" : current ? "text-sky-700" : "text-slate-500"
                  }`}
                >
                  {step === 0 ? "Base slide state before cues." : `Reveal cue ${step} becomes active.`}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="rounded-[6px] border border-dashed border-slate-200/80 bg-slate-50/75 px-4 py-5 text-sm text-slate-500">
          No cue steps detected on this slide yet.
        </div>
      )}
    </section>
  )
}
