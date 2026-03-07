import { LayoutGrid, MousePointerClick, NotebookText, PenLine, X } from "lucide-react";
import { ChromePanel } from "../../ui/primitives/ChromePanel";
import { ChromeTag } from "../../ui/primitives/ChromeTag";

function renderNotes(notes: string) {
  const sections = notes
    .split(/\n\s*\n/g)
    .map((section) => section.trim())
    .filter(Boolean);

  return sections.map((section, index) => (
    <p key={`${index}-${section.slice(0, 24)}`} className="whitespace-pre-wrap">
      {section}
    </p>
  ));
}

export function SpeakerNotesPanel({
  currentClicks,
  currentClicksTotal,
  notes,
}: {
  currentClicks: number;
  currentClicksTotal: number;
  notes?: string;
}) {
  return (
    <ChromePanel className="flex flex-col">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Notes
        </p>
        <ChromeTag>
          {currentClicksTotal > 0 ? `Clicks ${currentClicks}/${currentClicksTotal}` : "Slide cue"}
        </ChromeTag>
      </div>
      <ChromePanel tone="inset" radius="frame" className="flex-1 p-4 text-sm leading-7">
        {notes ? (
          <div className="space-y-4 text-slate-600">{renderNotes(notes)}</div>
        ) : (
          <>
            <p className="font-medium text-slate-900">No notes yet.</p>
            <p className="mt-3 text-slate-500">
              Add slide-level frontmatter with <code>notes: |</code> to keep your phrasing,
              punchlines, and handoff lines close to the slide.
            </p>
          </>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <ChromeTag tone="muted" className="gap-1.5">
            <NotebookText size={13} />
            <span>N</span>
          </ChromeTag>
          <ChromeTag tone="muted" className="gap-1.5">
            <LayoutGrid size={13} />
            <span>O</span>
          </ChromeTag>
          <ChromeTag tone="muted" className="gap-1.5">
            <PenLine size={13} />
            <span>D</span>
          </ChromeTag>
          <ChromeTag tone="muted" className="gap-1.5">
            <MousePointerClick size={13} />
          </ChromeTag>
          <ChromeTag tone="muted" className="gap-1.5">
            <X size={13} />
            <span>Esc</span>
          </ChromeTag>
        </div>
      </ChromePanel>
    </ChromePanel>
  );
}
