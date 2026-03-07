export interface SlidesViewport {
  width: number;
  height: number;
}

export const DEFAULT_SLIDES_AR = "16/9";
export const DEFAULT_SLIDES_VIEWPORT: SlidesViewport = {
  width: 1920,
  height: 1080,
};

const VIEWPORT_LONG_EDGE = 1920;
const ASPECT_RATIO_PATTERN = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/;

function parseAspectRatioUnits(ar: string) {
  const match = ar.trim().match(ASPECT_RATIO_PATTERN);
  if (!match) {
    throw new Error(
      `Invalid slides frontmatter: ar must use the form "width/height", received "${ar}"`,
    );
  }

  const widthUnits = Number.parseFloat(match[1]);
  const heightUnits = Number.parseFloat(match[2]);

  if (
    !Number.isFinite(widthUnits) ||
    !Number.isFinite(heightUnits) ||
    widthUnits <= 0 ||
    heightUnits <= 0
  ) {
    throw new Error(`Invalid slides frontmatter: ar must be a positive ratio, received "${ar}"`);
  }

  return {
    widthUnits,
    heightUnits,
  };
}

export function resolveSlidesViewportMeta(ar: string | undefined) {
  const normalizedAr = ar?.trim() || DEFAULT_SLIDES_AR;
  const { widthUnits, heightUnits } = parseAspectRatioUnits(normalizedAr);
  const scale = VIEWPORT_LONG_EDGE / Math.max(widthUnits, heightUnits);

  return {
    ar: `${widthUnits}/${heightUnits}`,
    viewport: {
      width: Math.round(widthUnits * scale),
      height: Math.round(heightUnits * scale),
    } satisfies SlidesViewport,
  };
}

export function formatViewportAspectRatio(viewport: SlidesViewport) {
  return `${viewport.width} / ${viewport.height}`;
}

export function isPortraitViewport(viewport: SlidesViewport) {
  return viewport.height > viewport.width;
}

export function resolvePrintPageSize(viewport: SlidesViewport) {
  const baseMm = 210;

  if (isPortraitViewport(viewport)) {
    return {
      widthMm: baseMm,
      heightMm: Number(((baseMm * viewport.height) / viewport.width).toFixed(2)),
    };
  }

  return {
    widthMm: Number(((baseMm * viewport.width) / viewport.height).toFixed(2)),
    heightMm: baseMm,
  };
}
