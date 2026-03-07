import { useMemo, type HTMLAttributes, type ReactNode } from "react";
import type { SlideMeta, SlideComponent } from "../../deck/model/slide";
import { useResolvedLayout } from "../../theme/useResolvedLayout";
import { resolveSlideSurface, resolveSlideSurfaceClassName } from "./slideSurface";
import { SLIDE_HEIGHT, SLIDE_WIDTH, useSlideScale } from "./slideViewport";

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function SlidePreviewSurface({
  Slide,
  meta,
  deckLayout,
  deckBackground,
  content,
  viewportClassName,
  stageClassName,
  shadowClass,
  overflowHidden = false,
  scaleMultiplier = 1,
  articleProps,
}: {
  Slide: SlideComponent;
  meta: SlideMeta;
  deckLayout?: SlideMeta["layout"];
  deckBackground?: string;
  content?: ReactNode;
  viewportClassName?: string;
  stageClassName?: string;
  shadowClass?: string;
  overflowHidden?: boolean;
  scaleMultiplier?: number;
  articleProps?: HTMLAttributes<HTMLElement>;
}) {
  const Layout = useResolvedLayout(meta.layout ?? deckLayout);
  const { viewportRef, scale, offset } = useSlideScale(scaleMultiplier);
  const viewportStageStyle = useMemo(
    () => ({
      width: `${SLIDE_WIDTH}px`,
      height: `${SLIDE_HEIGHT}px`,
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
      transformOrigin: "top left",
    }),
    [offset.x, offset.y, scale],
  );
  const {
    className: articleClassName,
    style: articleStyle,
    ...restArticleProps
  } = articleProps ?? {};
  const surface = resolveSlideSurface({
    meta,
    deckBackground,
    className: resolveSlideSurfaceClassName({
      layout: meta.layout ?? deckLayout,
      shadowClass,
      overflowHidden,
    }),
  });

  return (
    <div ref={viewportRef} className={viewportClassName}>
      <div className={stageClassName} style={viewportStageStyle}>
        <article
          {...restArticleProps}
          className={joinClassNames(surface.className, articleClassName)}
          style={{
            ...surface.style,
            ...articleStyle,
            width: `${SLIDE_WIDTH}px`,
            height: `${SLIDE_HEIGHT}px`,
          }}
        >
          {content ?? (
            <Layout>
              <Slide />
            </Layout>
          )}
        </article>
      </div>
    </div>
  );
}
