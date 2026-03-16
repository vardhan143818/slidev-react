import mermaid from "mermaid/dist/mermaid.esm.min.mjs";
import { Expand, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSlideThemeTokens } from "../../../theme/ThemeProvider";
import { serializeThemeTokens } from "../../../theme/themeTokens";
import type { SlideThemeTokens } from "../../../theme/types";

function normalizeDiagramCode(code: string | undefined, children: ReactNode) {
  if (typeof code === "string") return code;

  if (typeof children === "string") return children;

  if (Array.isArray(children)) return children.join("");

  return "";
}

let initialized = false;
let renderQueue = Promise.resolve();

type MermaidRenderVariant = "preview" | "zoom";

export function resolveMermaidThemeVariables(tokens: SlideThemeTokens): Record<string, string> {
  return {
    fontFamily: tokens.fonts.sans,
    fontSize: "19px",
    primaryColor: tokens.diagram.primary,
    primaryTextColor: tokens.diagram.text,
    primaryBorderColor: tokens.diagram.primaryBorder,
    lineColor: tokens.diagram.line,
    background: tokens.diagram.surface,
    mainBkg: tokens.diagram.surface,
    secondBkg: tokens.diagram.surfaceAlt,
    tertiaryColor: tokens.diagram.surfaceAlt,
    textColor: tokens.diagram.text,
    secondaryColor: tokens.diagram.line,
    tertiaryTextColor: tokens.diagram.text,
    border1: tokens.diagram.primaryBorder,
    border2: tokens.diagram.line,
    nodeBkg: tokens.diagram.surfaceAlt,
    nodeBorder: tokens.diagram.line,
    nodeTextColor: tokens.diagram.text,
    clusterBkg: tokens.diagram.surfaceAlt,
    clusterBorder: tokens.diagram.primaryBorder,
    edgeLabelBackground: tokens.diagram.surface,
    arrowheadColor: tokens.diagram.line,
    actorBkg: tokens.diagram.surface,
    actorBorder: tokens.diagram.primaryBorder,
    actorTextColor: tokens.diagram.text,
    actorLineColor: tokens.diagram.line,
    signalColor: tokens.diagram.line,
    signalTextColor: tokens.diagram.text,
    labelBoxBkgColor: tokens.diagram.surfaceAlt,
    labelBoxBorderColor: tokens.diagram.primaryBorder,
    labelTextColor: tokens.diagram.text,
    loopTextColor: tokens.diagram.text,
    noteBkgColor: tokens.diagram.note,
    noteTextColor: tokens.diagram.text,
    noteBorderColor: tokens.diagram.primaryBorder,
    activationBkgColor: tokens.diagram.primary,
    activationBorderColor: tokens.diagram.primaryBorder,
    labelColor: tokens.diagram.text,
    classText: tokens.diagram.text,
    git0: tokens.diagram.categorical[0],
    git1: tokens.diagram.categorical[1],
    git2: tokens.diagram.categorical[2],
    git3: tokens.diagram.categorical[3],
    git4: tokens.diagram.categorical[4],
    git5: tokens.diagram.categorical[5],
    git6: tokens.diagram.accent,
    git7: tokens.diagram.line,
    gitInv0: tokens.diagram.surface,
    gitInv1: tokens.diagram.surface,
    gitInv2: tokens.diagram.surface,
    gitInv3: tokens.diagram.surface,
    gitInv4: tokens.diagram.surface,
    gitInv5: tokens.diagram.surface,
    gitInv6: tokens.diagram.surface,
    gitInv7: tokens.diagram.surface,
    commitLabelColor: tokens.diagram.text,
    commitLabelBackground: tokens.diagram.surfaceAlt,
    fillType0: tokens.diagram.accent,
    fillType1: tokens.diagram.categorical[1],
    fillType2: tokens.diagram.categorical[2],
    fillType3: tokens.diagram.categorical[3],
    fillType4: tokens.diagram.categorical[4],
    fillType5: tokens.diagram.categorical[5],
    fillType6: tokens.diagram.primaryBorder,
    fillType7: tokens.diagram.line,
  };
}

export function resolveMermaidSurfaceStyle(tokens: SlideThemeTokens) {
  return {
    color: tokens.diagram.text,
    fontFamily: tokens.fonts.sans,
  };
}

export function resolveMermaidFrameStyle(tokens: SlideThemeTokens) {
  return {
    borderColor: tokens.ui.border,
    background: tokens.diagram.surface,
  };
}

export function resolveMermaidMutedSurfaceStyle(tokens: SlideThemeTokens) {
  return {
    borderColor: tokens.ui.border,
    background: tokens.diagram.surfaceAlt,
    color: tokens.diagram.line,
  };
}

function createMermaidConfig(tokens: SlideThemeTokens, variant: MermaidRenderVariant) {
  const themeVariables = resolveMermaidThemeVariables(tokens);
  const fontFamily = themeVariables.fontFamily ?? tokens.fonts.sans;

  if (variant === "preview") {
    return {
      startOnLoad: false,
      securityLevel: "loose" as const,
      theme: "base" as const,
      htmlLabels: false,
      themeVariables: {
        ...themeVariables,
        fontSize: "17px",
      },
      themeCSS: `
        svg, svg * {
          font-family: ${fontFamily};
        }
        .label,
        .label text,
        .nodeLabel,
        .edgeLabel,
        .cluster-label,
        .stateLabel text,
        foreignObject div {
          font-family: ${fontFamily};
        }
      `,
      flowchart: {
        curve: "basis" as const,
        padding: 15,
        htmlLabels: false,
      },
      state: {} as Record<string, unknown>,
      sequence: {
        actorFontSize: 17,
        noteFontSize: 16,
        messageFontSize: 16,
      },
      gantt: {
        fontSize: 16,
      },
      journey: {
        taskFontSize: 16,
        titleFontSize: "19px",
      },
    };
  }

  return {
    startOnLoad: false,
    securityLevel: "loose" as const,
    theme: "base" as const,
    htmlLabels: false,
    themeVariables,
    themeCSS: `
      svg, svg * {
        font-family: ${fontFamily};
      }
      .label,
      .label text,
      .nodeLabel,
      .edgeLabel,
      .cluster-label,
      .stateLabel text,
      foreignObject div {
        font-family: ${fontFamily};
      }
    `,
    flowchart: {
      curve: "basis" as const,
      padding: 15,
      htmlLabels: false,
    },
    state: {} as Record<string, unknown>,
    sequence: {
      actorFontSize: 19,
      noteFontSize: 18,
      messageFontSize: 18,
    },
    gantt: {
      fontSize: 18,
    },
    journey: {
      taskFontSize: 18,
      titleFontSize: "21px",
    },
  };
}

function ensureMermaid(tokens: SlideThemeTokens) {
  if (initialized) return;

  mermaid.initialize(createMermaidConfig(tokens, "zoom"));
  initialized = true;
}

async function enqueueMermaidRender<T>(task: () => Promise<T>) {
  const next = renderQueue.then(task, task);
  renderQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

async function renderMermaidSvg(
  id: string,
  source: string,
  variant: MermaidRenderVariant,
  tokens: SlideThemeTokens,
) {
  ensureMermaid(tokens);
  mermaid.initialize(createMermaidConfig(tokens, variant));
  const result = await mermaid.render(id, source);
  return result.svg;
}

export function MermaidDiagram({ code, children }: { code?: string; children?: ReactNode }) {
  const tokens = useSlideThemeTokens();
  const themeSignature = useMemo(() => serializeThemeTokens(tokens), [tokens]);
  const source = normalizeDiagramCode(code, children);
  const [previewSvg, setPreviewSvg] = useState<string>("");
  const [zoomSvg, setZoomSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [zoomLoading, setZoomLoading] = useState(false);
  const previewId = useMemo(() => `mermaid-preview-${Math.random().toString(36).slice(2, 10)}`, []);
  const zoomId = useMemo(() => `mermaid-zoom-${Math.random().toString(36).slice(2, 10)}`, []);
  const diagramSurfaceStyle = useMemo(
    () => resolveMermaidSurfaceStyle(tokens),
    [themeSignature, tokens],
  );
  const diagramFrameStyle = useMemo(
    () => resolveMermaidFrameStyle(tokens),
    [themeSignature, tokens],
  );
  const diagramMutedSurfaceStyle = useMemo(
    () => resolveMermaidMutedSurfaceStyle(tokens),
    [themeSignature, tokens],
  );

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        setPreviewSvg("");
        setZoomSvg("");
        setZoomLoading(false);
        const svg = await enqueueMermaidRender(() =>
          renderMermaidSvg(previewId, source, "preview", tokens),
        );
        if (!cancelled) {
          setPreviewSvg(svg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [previewId, source, themeSignature, tokens]);

  useEffect(() => {
    if (!zoomed || zoomSvg) return;

    let cancelled = false;

    const render = async () => {
      try {
        setZoomLoading(true);
        const svg = await enqueueMermaidRender(() =>
          renderMermaidSvg(zoomId, source, "zoom", tokens),
        );
        if (!cancelled) {
          setZoomSvg(svg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setZoomLoading(false);
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [source, themeSignature, tokens, zoomId, zoomSvg, zoomed]);

  useEffect(() => {
    if (!zoomed) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [zoomed]);

  if (error) {
    return (
      <div className="my-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">
        Mermaid render error: {error}
      </div>
    );
  }

  if (!previewSvg) {
    return (
      <div className="my-3 rounded-xl border p-3 text-sm" style={diagramMutedSurfaceStyle}>
        Rendering Mermaid...
      </div>
    );
  }

  const zoomOverlay =
    zoomed && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-sm"
            style={{ background: "color-mix(in srgb, var(--slide-ui-surface) 72%, transparent)" }}
            onClick={() => setZoomed(false)}
          >
            <div
              className="relative flex h-[min(92vh,1200px)] w-[min(96vw,1600px)] flex-col overflow-hidden rounded-3xl border"
              style={{
                borderColor: tokens.ui.border,
                background: tokens.diagram.surface,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div
                className="flex items-center justify-between border-b px-5 py-3 text-sm"
                style={{
                  borderColor: tokens.ui.border,
                  color: tokens.ui.muted,
                }}
              >
                <div>
                  <div
                    className="font-semibold tracking-[0.16em] uppercase"
                    style={{ color: tokens.ui.heading }}
                  >
                    Mermaid
                  </div>
                  <div className="mt-1 text-xs" style={{ color: tokens.ui.muted }}>
                    Esc or click outside to close
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setZoomed(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition"
                  style={{
                    borderColor: tokens.ui.border,
                    background: tokens.diagram.surfaceAlt,
                    color: tokens.ui.muted,
                  }}
                  aria-label="Close Mermaid zoom preview"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div
                className="flex-1 overflow-auto p-6"
                style={{ background: tokens.diagram.surfaceAlt }}
              >
                {zoomSvg ? (
                  <div
                    className="inline-block min-w-full rounded-2xl border p-6 [&_svg]:h-auto [&_svg]:max-w-none [&_svg_tspan]:fill-current [&_svg_text]:fill-current"
                    style={{ ...diagramSurfaceStyle, ...diagramFrameStyle }}
                    dangerouslySetInnerHTML={{ __html: zoomSvg }}
                  />
                ) : (
                  <div className="rounded-2xl border p-6 text-sm" style={diagramMutedSurfaceStyle}>
                    {zoomLoading ? "Preparing Mermaid preview..." : "Rendering Mermaid..."}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="my-3">
        <div
          className="relative w-full overflow-hidden rounded-xl border p-3 shadow-sm"
          style={diagramFrameStyle}
        >
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition"
            style={{
              borderColor: tokens.ui.border,
              background: "color-mix(in srgb, var(--slide-diagram-surface) 92%, white 8%)",
              color: tokens.ui.muted,
            }}
            aria-label="Open Mermaid zoom preview"
            title="Zoom Mermaid diagram"
          >
            <Expand size={16} />
          </button>
          <div className="max-w-full overflow-x-auto pr-12">
            <div
              className="w-full [&_svg]:block [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-full [&_svg_tspan]:fill-current [&_svg_text]:fill-current"
              style={diagramSurfaceStyle}
              dangerouslySetInnerHTML={{ __html: previewSvg }}
            />
          </div>
        </div>
      </div>
      {zoomOverlay}
    </>
  );
}
