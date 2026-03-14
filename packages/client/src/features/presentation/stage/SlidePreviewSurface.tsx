import { useMemo, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import type { SlideMeta, SlideComponent } from "@slidev-react/core/slides/slide";
import type { SlidesConfig } from "../presenter/types";
import { useResolvedLayout } from "../../../theme/useResolvedLayout";
import { resolveSlideSurface, resolveSlideSurfaceClassName } from "./slideSurface";
import { useSlideScale } from "./slideViewport";

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

type SlideArticleProps = HTMLAttributes<HTMLElement> & {
  "data-export-surface"?: string;
};

export function SlidePreviewSurface({
  Slide,
  meta,
  slidesConfig,
  content,
  viewportClassName,
  viewportStyle,
  stageClassName,
  shadowClass,
  overflowHidden = false,
  scaleMultiplier = 1,
  alignment = "center",
  articleProps,
}: {
  Slide: SlideComponent;
  meta: SlideMeta;
  slidesConfig: Pick<SlidesConfig, "slidesViewport" | "slidesLayout" | "slidesBackground">;
  content?: ReactNode;
  viewportClassName?: string;
  viewportStyle?: CSSProperties;
  stageClassName?: string;
  shadowClass?: string;
  overflowHidden?: boolean;
  scaleMultiplier?: number;
  alignment?: "center" | "top-left";
  articleProps?: SlideArticleProps;
}) {
  const { slidesViewport, slidesLayout, slidesBackground } = slidesConfig;
  const Layout = useResolvedLayout(meta.layout ?? slidesLayout);
  const { viewportRef, scale, offset } = useSlideScale(scaleMultiplier, alignment, slidesViewport);
  const viewportStageStyle = useMemo(
    () => ({
      width: `${slidesViewport.width}px`,
      height: `${slidesViewport.height}px`,
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
      transformOrigin: "top left",
    }),
    [slidesViewport.height, slidesViewport.width, offset.x, offset.y, scale],
  );
  const {
    className: articleClassName,
    style: articleStyle,
    ...restArticleProps
  } = articleProps ?? {};
  const surface = resolveSlideSurface({
    meta,
    slidesBackground,
    className: resolveSlideSurfaceClassName({
      layout: meta.layout ?? slidesLayout,
      shadowClass,
      overflowHidden,
    }),
  });

  return (
    <div ref={viewportRef} className={viewportClassName} style={viewportStyle}>
      <div className={stageClassName} style={viewportStageStyle}>
        <article
          {...restArticleProps}
          className={joinClassNames(surface.className, articleClassName)}
          style={{
            ...surface.style,
            ...articleStyle,
            width: `${slidesViewport.width}px`,
            height: `${slidesViewport.height}px`,
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
