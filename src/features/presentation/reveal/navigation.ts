import {
  canAdvanceFlow,
  canRetreatFlow,
  clampCueIndex,
  resolveAdvanceFlow,
  resolveRetreatFlow,
} from "../../../core/presentation/flow/navigation";

export interface AdvanceRevealInput {
  currentClicks: number;
  currentClicksTotal: number;
  currentIndex: number;
  totalSlides: number;
}

export interface RetreatRevealInput {
  currentClicks: number;
  currentIndex: number;
  previousClicks?: number;
  previousClicksTotal?: number;
}

export interface RevealNavigationResult {
  page: number;
  clicks: number;
}

export function clampRevealCount(next: number, total?: number) {
  return clampCueIndex(next, total);
}

export function canAdvanceReveal({
  currentClicks,
  currentClicksTotal,
  currentIndex,
  totalSlides,
}: AdvanceRevealInput) {
  return canAdvanceFlow({
    currentCueIndex: currentClicks,
    currentCueTotal: currentClicksTotal,
    currentPageIndex: currentIndex,
    totalPages: totalSlides,
  });
}

export function canRetreatReveal({
  currentClicks,
  currentIndex,
}: Pick<RetreatRevealInput, "currentClicks" | "currentIndex">) {
  return canRetreatFlow({
    currentCueIndex: currentClicks,
    currentPageIndex: currentIndex,
  });
}

export function resolveAdvanceReveal({
  currentClicks,
  currentClicksTotal,
  currentIndex,
  totalSlides,
}: AdvanceRevealInput): RevealNavigationResult | null {
  const next = resolveAdvanceFlow({
    currentCueIndex: currentClicks,
    currentCueTotal: currentClicksTotal,
    currentPageIndex: currentIndex,
    totalPages: totalSlides,
  });

  if (!next) return null;

  return {
    page: next.pageIndex,
    clicks: next.cueIndex,
  };
}

export function resolveRetreatReveal({
  currentClicks,
  currentIndex,
  previousClicks,
  previousClicksTotal,
}: RetreatRevealInput): RevealNavigationResult | null {
  const next = resolveRetreatFlow({
    currentCueIndex: currentClicks,
    currentPageIndex: currentIndex,
    previousCueIndex: previousClicks,
    previousCueTotal: previousClicksTotal,
  });

  if (!next) return null;

  return {
    page: next.pageIndex,
    clicks: next.cueIndex,
  };
}
