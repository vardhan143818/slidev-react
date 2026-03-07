import { Keyboard, X } from "lucide-react";
import { ChromeIconButton } from "../../ui/primitives/ChromeIconButton";
import { ChromePanel } from "../../ui/primitives/ChromePanel";
import { ChromeTag } from "../../ui/primitives/ChromeTag";
import type { ShortcutHelpSection } from "./keyboardShortcuts";

function ShortcutKeys({ value }: { value: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {value.split(" / ").map((part, index, list) => (
        <span key={`${part}-${index}`} className="inline-flex items-center gap-1.5">
          <kbd className="rounded-[7px] border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
            {part}
          </kbd>
          {index < list.length - 1 ? <span className="text-slate-300">/</span> : null}
        </span>
      ))}
    </div>
  );
}

export function ShortcutsHelpOverlay({
  open,
  sections,
  onClose,
}: {
  open: boolean;
  sections: ShortcutHelpSection[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.4),transparent_34%),linear-gradient(180deg,rgba(241,245,249,0.84)_0%,rgba(226,232,240,0.92)_100%)] backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-[1480px] items-center justify-center px-5 py-5 sm:px-6">
        <ChromePanel
          tone="solid"
          radius="section"
          padding="none"
          className="flex max-h-full w-full max-w-[980px] flex-col overflow-hidden bg-white/90 shadow-[0_32px_90px_rgba(15,23,42,0.18)]"
        >
          <header className="border-b border-slate-200/80 px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <ChromeTag
                    tone="active"
                    size="md"
                    weight="semibold"
                    className="uppercase tracking-[0.18em]"
                  >
                    <Keyboard size={13} />
                    Keyboard Shortcuts
                  </ChromeTag>
                  <ChromeTag size="md">Press `?` or double-tap `Shift`</ChromeTag>
                </div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Everything the runtime can do from the keyboard
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  This list only shows shortcuts that are actually implemented right now, so it
                  stays trustworthy as the product evolves.
                </p>
              </div>
              <ChromeIconButton
                onClick={onClose}
                aria-label="Close keyboard shortcuts"
                title="Close keyboard shortcuts"
                className="rounded-full shadow-[0_10px_30px_rgba(148,163,184,0.22)]"
              >
                <X size={18} />
              </ChromeIconButton>
            </div>
          </header>
          <div className="min-h-0 overflow-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-4 md:grid-cols-2">
              {sections.map((section) => (
                <ChromePanel
                  key={section.title}
                  tone="frame"
                  radius="section"
                  className="overflow-hidden border border-slate-200/80 bg-slate-50/72"
                >
                  <div className="border-b border-slate-200/75 px-4 py-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
                      {section.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{section.description}</p>
                  </div>
                  <div className="px-4 py-3">
                    <div className="space-y-2.5">
                      {section.items.map((item) => (
                        <div
                          key={`${section.title}:${item.keys}:${item.action}`}
                          className="flex flex-col gap-2 rounded-[10px] border border-white/80 bg-white/82 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                        >
                          <ShortcutKeys value={item.keys} />
                          <div className="text-sm leading-6 text-slate-700">{item.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ChromePanel>
              ))}
            </div>
          </div>
        </ChromePanel>
      </div>
    </div>
  );
}
