import type { CSSProperties } from "react";
import type { SlideMeta } from "../../deck/model/slide";

function joinClassNames(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(" ");
}

function looksLikeBareImageSource(value: string) {
  return (
    /^(?:https?:\/\/|data:image\/|\/|\.\.?\/)/.test(value) ||
    /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(value)
  );
}

function resolveBackgroundStyle(background: string | undefined): CSSProperties {
  const style: CSSProperties = {
    backgroundColor: "#ffffff",
  };

  if (!background) return style;

  const trimmed = background.trim();
  if (!trimmed) return style;

  if (looksLikeBareImageSource(trimmed)) {
    style.backgroundImage = `url(${JSON.stringify(trimmed)})`;
    style.backgroundPosition = "center";
    style.backgroundRepeat = "no-repeat";
    style.backgroundSize = "cover";
    return style;
  }

  style.background = trimmed;
  return style;
}

function resolveSurfacePaddingClass(layout: SlideMeta["layout"]) {
  return layout === "immersive" ? "px-0 py-0" : "px-18 py-14";
}

export function resolveSlideSurfaceClassName({
  layout,
  shadowClass,
  overflowHidden = false,
}: {
  layout: SlideMeta["layout"];
  shadowClass?: string;
  overflowHidden?: boolean;
}) {
  return joinClassNames(
    "slide-prose relative box-border size-full",
    overflowHidden ? "overflow-hidden" : undefined,
    resolveSurfacePaddingClass(layout),
    shadowClass,
  );
}

export function resolveSlideSurface({
  meta,
  deckBackground,
  className,
}: {
  meta: SlideMeta;
  deckBackground?: string;
  className?: string;
}) {
  return {
    className: joinClassNames(className, meta.class),
    style: resolveBackgroundStyle(meta.background ?? deckBackground),
  };
}
