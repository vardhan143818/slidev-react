import { LayoutGrid, MousePointerClick, NotebookText, PenLine, X } from "lucide-react";

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
    <section className="flex min-h-0 flex-col rounded-[8px] border border-slate-200/70 bg-white/72 p-4 shadow-[0_18px_44px_rgba(148,163,184,0.18)] backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Notes
        </p>
        <span className="rounded-[5px] border border-slate-200 bg-white/88 px-2.5 py-1 text-[11px] font-medium text-slate-500">
          {currentClicksTotal > 0 ? `Clicks ${currentClicks}/${currentClicksTotal}` : "Slide cue"}
        </span>
      </div>
      <div className="min-h-0 flex-1 rounded-[5px] border border-slate-200/80 bg-slate-50/78 p-4 text-sm leading-7 text-slate-600">
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
          <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-slate-200 bg-white/72 px-2.5 py-1">
            <NotebookText size={13} />
            <span>N</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-slate-200 bg-white/72 px-2.5 py-1">
            <LayoutGrid size={13} />
            <span>O</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-slate-200 bg-white/72 px-2.5 py-1">
            <PenLine size={13} />
            <span>D</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-slate-200 bg-white/72 px-2.5 py-1">
            <MousePointerClick size={13} />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-slate-200 bg-white/72 px-2.5 py-1">
            <X size={13} />
            <span>Esc</span>
          </span>
        </div>
      </div>
    </section>
  );
}
