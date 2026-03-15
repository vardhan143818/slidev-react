import type { CSSProperties, ReactNode } from "react";

type CoverColor = "green" | "purple" | "blue" | "orange";
type CoverTone = "dark" | "light";

const colorTokenMap: Record<CoverColor, { accent: string; soft: string; ink: string }> = {
  green: {
    accent: "#58c7a7",
    soft: "#ddf2ec",
    ink: "#167a61",
  },
  purple: {
    accent: "#a9a1e5",
    soft: "#e7e5fa",
    ink: "#5d55a6",
  },
  blue: {
    accent: "#88b7ea",
    soft: "#dce9fa",
    ink: "#3f73b8",
  },
  orange: {
    accent: "#f29a79",
    soft: "#f9ece6",
    ink: "#9a5521",
  },
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
  const palette = colorTokenMap[color];
  const displayLesson = lesson ?? "00";
  const isLight = tone === "light";
  const style = {
    "--cc-accent": palette.accent,
    "--cc-accent-soft": palette.soft,
    "--cc-accent-ink": palette.ink,
    "--cc-bg": isLight ? "var(--slide-ui-background, #f7f3ed)" : "#1f1d1a",
    "--cc-surface": isLight
      ? "color-mix(in srgb, var(--slide-ui-surface, #fbf8f3) 88%, white 12%)"
      : "rgba(255, 255, 255, 0.05)",
    "--cc-surface-strong": isLight
      ? "color-mix(in srgb, var(--cc-accent-soft) 38%, var(--slide-ui-surface, #fbf8f3) 62%)"
      : "rgba(255, 255, 255, 0.08)",
    "--cc-border": isLight
      ? "color-mix(in srgb, var(--slide-ui-border, #e8e0d6) 80%, var(--cc-accent) 20%)"
      : "rgba(255, 255, 255, 0.12)",
    "--cc-text": isLight ? "var(--slide-ui-heading, #1f1d1a)" : "#f7f3ed",
    "--cc-muted": isLight ? "var(--slide-ui-muted, #6f685f)" : "rgba(247, 243, 237, 0.72)",
    "--cc-shadow": isLight
      ? "0 24px 60px rgba(136, 183, 234, 0.08)"
      : "0 24px 60px rgba(0, 0, 0, 0.28)",
  } as CSSProperties;

  return (
    <section className="absolute inset-0 flex flex-col overflow-hidden" style={style}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: isLight
            ? "linear-gradient(180deg, color-mix(in srgb, var(--cc-bg) 92%, white 8%) 0%, var(--cc-bg) 100%)"
            : "linear-gradient(180deg, #23211d 0%, #171614 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8%] top-[-16%] h-[30rem] w-[30rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--cc-accent-soft) 80%, white 20%) 0%, color-mix(in srgb, var(--cc-accent) 18%, transparent) 42%, transparent 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-18%] left-[-8%] h-[24rem] w-[24rem] rounded-full opacity-80"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(231, 229, 250, 0.6) 0%, transparent 68%)"
            : "radial-gradient(circle, rgba(169, 161, 229, 0.16) 0%, transparent 68%)",
        }}
      />

      {/* Lesson number watermark */}
      <div
        className="pointer-events-none absolute right-[0.05em] top-[-0.1em] z-0 text-[18rem] font-black leading-none tracking-[-0.05em] text-[var(--cc-accent)]"
        style={{ opacity: isLight ? 0.15 : 0.08 }}
      >
        {displayLesson}
      </div>

      {/* Header */}
      <header className="relative z-[3] flex items-center justify-between px-10 py-8">
        {lesson ? (
          <div
            className="flex items-baseline gap-1 rounded-full px-4 py-2 font-mono"
            style={{
              border: "1px solid var(--cc-border)",
              background: "var(--cc-surface)",
              boxShadow: "var(--cc-shadow)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="text-[1.4rem] font-bold text-[var(--cc-accent)]">{lesson}</span>
            <span className="text-[1rem] text-[var(--cc-muted)]">/</span>
            <span className="text-[1rem] text-[var(--cc-muted)]">{total}</span>
          </div>
        ) : null}
      </header>

      {/* Content */}
      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-10 text-center">
        {title ? (
          <h1 className="m-0 mb-4 text-[clamp(3.35rem,5.7vw,5.45rem)] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--cc-text)]">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="m-0 max-w-[600px] text-[clamp(1.38rem,2vw,1.72rem)] leading-[1.5] text-[var(--cc-muted)] opacity-[0.95]">
            {subtitle}
          </p>
        ) : null}
        {children}
      </div>

      {/* Footer */}
      <footer className="relative z-[3] flex items-center justify-between px-10 py-8">
        {series ? (
          <div
            className="inline-flex items-center rounded-full px-4 py-2 text-[1rem] font-semibold uppercase tracking-[0.05em]"
            style={{
              border: "1px solid var(--cc-border)",
              background: "var(--cc-surface-strong)",
              color: isLight ? "var(--cc-accent-ink)" : "var(--cc-accent)",
              boxShadow: "var(--cc-shadow)",
              backdropFilter: "blur(10px)",
            }}
          >
            {series}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {author ? (
          <div className="flex items-center gap-3">
            <span className="text-[0.82rem] uppercase tracking-[0.1em] text-[var(--cc-muted)]">
              Speaker
            </span>
            <span className="text-[1.08rem] font-medium text-[var(--cc-text)]">{author}</span>
          </div>
        ) : null}
      </footer>
    </section>
  );
}
