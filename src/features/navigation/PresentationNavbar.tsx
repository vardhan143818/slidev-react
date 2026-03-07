import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  NotebookText,
  PenLine,
  Radio,
} from "lucide-react";
import { useState } from "react";
import { useDraw } from "../draw/DrawProvider";

function iconButtonClassName(active?: boolean) {
  if (active) {
    return "inline-flex size-8 items-center justify-center rounded-md border border-blue-300 bg-blue-100 text-blue-800 transition-colors";
  }

  return "inline-flex size-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50/95 text-slate-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-45";
}

function DrawControls() {
  const draw = useDraw();

  return (
    <button
      type="button"
      onClick={draw.toggleEnabled}
      title="Toggle draw (D)"
      aria-label="Toggle draw mode"
      className={iconButtonClassName(draw.enabled)}
    >
      <PenLine size={16} />
    </button>
  );
}

export function PresentationNavbar({
  slideTitle,
  currentIndex,
  total,
  canPrev,
  canNext,
  showPresenterModeButton,
  overviewOpen,
  notesOpen,
  canOpenOverview,
  onEnterPresenterMode,
  onToggleOverview,
  onToggleNotes,
  onPrev,
  onNext,
  canControl,
}: {
  slideTitle?: string;
  currentIndex: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  showPresenterModeButton: boolean;
  overviewOpen: boolean;
  notesOpen: boolean;
  canOpenOverview: boolean;
  onEnterPresenterMode?: () => void;
  onToggleOverview: () => void;
  onToggleNotes: () => void;
  onPrev: () => void;
  onNext: () => void;
  canControl: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="absolute bottom-0 left-4 z-40"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div aria-hidden className="h-14 w-20 rounded-t-2xl" />
      <nav
        className={`absolute bottom-0 left-0 flex items-center gap-1 rounded-t-xl border border-b-0 border-slate-200 bg-white/95 px-2 py-1.5 text-slate-800 shadow-[0_-8px_20px_rgba(15,23,42,0.08)] ring-1 ring-black/5 backdrop-blur-md transition-[opacity,transform] ${open ? "pointer-events-auto translate-y-0 opacity-100 duration-0" : "pointer-events-none translate-y-2 opacity-0 duration-180"}`}
        aria-label="Presentation navbar"
      >
        <button
          type="button"
          className={iconButtonClassName()}
          title={`${slideTitle ?? "Slide"} (${currentIndex + 1}/${total})`}
          aria-label="Current slide info"
        >
          <BookOpenText size={15} />
        </button>
        <button
          type="button"
          onClick={onToggleNotes}
          title="Notes Workspace (N)"
          aria-label="Toggle notes workspace"
          className={iconButtonClassName(notesOpen)}
          disabled={!canControl}
        >
          <NotebookText size={16} />
        </button>
        <button
          type="button"
          onClick={onToggleOverview}
          title="Quick Overview (O)"
          aria-label="Toggle quick overview"
          className={iconButtonClassName(overviewOpen)}
          disabled={!canOpenOverview}
        >
          <LayoutGrid size={16} />
        </button>
        {showPresenterModeButton && (
          <button
            type="button"
            onClick={onEnterPresenterMode}
            title="Enter presenter mode"
            aria-label="Enter presenter mode"
            className={iconButtonClassName()}
          >
            <Radio size={15} />
          </button>
        )}
        {canControl && (
          <>
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              title="Previous slide"
              aria-label="Previous slide"
              className={iconButtonClassName()}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              title="Next slide"
              aria-label="Next slide"
              className={iconButtonClassName()}
            >
              <ChevronRight size={16} />
            </button>
            <div className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
            <DrawControls />
          </>
        )}
      </nav>
    </div>
  );
}
