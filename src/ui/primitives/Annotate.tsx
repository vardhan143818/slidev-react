import { type CSSProperties, type ReactNode } from "react";
import { useRevealStep } from "../../features/presentation/reveal/useRevealStep";

type AnnotateType = "underline" | "box" | "circle" | "highlight" | "strike-through" | "crossed-off";

export type AnnotateProps = {
  children: ReactNode;
  type?: AnnotateType;
  step?: number;
  animate?: boolean;
  color?: string;
};

const DEFAULT_ANIMATION_DURATION_MS = 520;

const defaultColorByType: Record<AnnotateType, string> = {
  underline: "#16a34a",
  box: "#16a34a",
  circle: "#16a34a",
  highlight: "rgba(250, 204, 21, 0.78)",
  "strike-through": "#ef4444",
  "crossed-off": "#ef4444",
};

const defaultPaddingByType: Record<AnnotateType, [number, number, number, number]> = {
  underline: [0, 2, 2, 2],
  box: [2, 5, 2, 5],
  circle: [3, 7, 3, 7],
  highlight: [1, 3, 1, 3],
  "strike-through": [0, 2, 0, 2],
  "crossed-off": [1, 3, 1, 3],
};

const defaultStrokeWidthByType: Record<AnnotateType, number> = {
  underline: 2.4,
  box: 2.2,
  circle: 2.2,
  highlight: 0,
  "strike-through": 2.2,
  "crossed-off": 2.2,
};

const joinClassNames = (...names: Array<string | false>) => {
  return names.filter(Boolean).join(" ");
};

export function Annotate({
  children,
  type = "highlight",
  step,
  animate = step !== undefined,
  color,
}: AnnotateProps) {
  const { isVisible } = useRevealStep(step);

  const [padTop, padRight, padBottom, padLeft] = defaultPaddingByType[type];
  const shouldRenderMark = isVisible;
  const style = {
    "--mark-color": color ?? defaultColorByType[type],
    "--mark-stroke-width": `${defaultStrokeWidthByType[type]}px`,
    "--mark-pad-top": `${padTop}px`,
    "--mark-pad-right": `${padRight}px`,
    "--mark-pad-bottom": `${padBottom}px`,
    "--mark-pad-left": `${padLeft}px`,
    "--mark-animation-duration": `${DEFAULT_ANIMATION_DURATION_MS}ms`,
    "--mark-animation-iterations": "1",
  } as CSSProperties;

  return (
    <span
      className={joinClassNames(
        "slide-mark",
        `slide-mark--${type}`,
        shouldRenderMark && animate && "slide-mark--animate",
      )}
      style={style}
    >
      <span className="slide-mark-target">{children}</span>
      {shouldRenderMark ? <span aria-hidden className="slide-mark-overlay" /> : null}
    </span>
  );
}
