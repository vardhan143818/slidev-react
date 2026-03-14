import type { CSSProperties, ReactNode } from "react";

type CoverColor = "green" | "purple" | "blue" | "orange";
type CoverTone = "dark" | "light";

const colorTokenMap: Record<CoverColor, string> = {
  green: "#22C55E",
  purple: "#A855F7",
  blue: "#3B82F6",
  orange: "#F97316",
};

export function CourseCover({
  color = "green",
  tone = "dark",
  lesson,
  total = "10",
  series,
  title,
  subtitle,
  author,
  children,
}: {
  color?: CoverColor;
  tone?: CoverTone;
  lesson?: string;
  total?: string;
  series?: string;
  title?: string;
  subtitle?: string;
  author?: string;
  children?: ReactNode;
}) {
  const accent = colorTokenMap[color];
  const displayLesson = lesson ?? "00";
  const style = { "--cc-accent": accent } as CSSProperties;
  const isLight = tone === "light";

  return (
    <section
      className={`absolute inset-0 flex flex-col overflow-hidden ${isLight ? "bg-[#f8fafc] text-[#0f172a]" : "bg-[#1c1c1c] text-[#ededed]"}`}
      style={style}
    >
      {/* Lesson number watermark */}
      <div
        className={`pointer-events-none absolute right-[0.05em] top-[-0.1em] z-0 text-[18rem] font-black leading-none tracking-[-0.05em] text-[var(--cc-accent)] ${isLight ? "opacity-[0.13]" : "opacity-[0.06]"}`}
      >
        {displayLesson}
      </div>

      {/* Header */}
      <header className="relative z-[3] flex items-center justify-between px-10 py-8">
        {lesson ? (
          <div
            className={`flex items-baseline gap-1 rounded-full px-4 py-2 font-mono ${isLight ? "border border-[color-mix(in_srgb,var(--cc-accent)_18%,#cbd5e1_82%)] bg-white/72" : "border border-[color-mix(in_srgb,var(--cc-accent)_30%,#333_70%)] bg-[rgba(37,37,37,0.6)]"}`}
          >
            <span className="text-[1.4rem] font-bold text-[var(--cc-accent)]">{lesson}</span>
            <span className={`text-[1rem] ${isLight ? "text-[#64748b]" : "text-[#999]"}`}>/</span>
            <span className={`text-[1rem] ${isLight ? "text-[#64748b]" : "text-[#999]"}`}>
              {total}
            </span>
          </div>
        ) : null}
      </header>

      {/* Content */}
      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-10 text-center">
        {title ? (
          <h1
            className={`m-0 mb-4 text-[clamp(3.35rem,5.7vw,5.45rem)] font-bold leading-[1.08] tracking-[-0.03em] ${isLight ? "text-[#0f172a]" : "text-[#ededed]"}`}
          >
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p
            className={`m-0 max-w-[600px] text-[clamp(1.38rem,2vw,1.72rem)] leading-[1.5] ${isLight ? "text-[#334155] opacity-[0.92]" : "text-[#d4d4d4] opacity-80"}`}
          >
            {subtitle}
          </p>
        ) : null}
        {children}
      </div>

      {/* Footer */}
      <footer className="relative z-[3] flex items-center justify-between px-10 py-8">
        {series ? (
          <div
            className={`inline-flex items-center rounded-full px-4 py-2 text-[1rem] font-semibold uppercase tracking-[0.05em] ${isLight ? "border border-[color-mix(in_srgb,var(--cc-accent)_18%,#cbd5e1_82%)] bg-white/72 text-[color-mix(in_srgb,var(--cc-accent)_72%,#14532d_28%)]" : "border border-[#333] bg-[rgba(37,37,37,0.6)] text-[var(--cc-accent)]"}`}
          >
            {series}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {author ? (
          <div className="flex items-center gap-3">
            <span
              className={`text-[0.82rem] uppercase tracking-[0.1em] ${isLight ? "text-[#64748b]" : "text-[#999]"}`}
            >
              Speaker
            </span>
            <span
              className={`text-[1.08rem] font-medium ${isLight ? "text-[#0f172a]" : "text-[#d4d4d4]"}`}
            >
              {author}
            </span>
          </div>
        ) : null}
      </footer>
    </section>
  );
}
