export interface AdvanceFlowInput {
  currentCueIndex: number;
  currentCueTotal: number;
  currentPageIndex: number;
  totalPages: number;
}

export interface RetreatFlowInput {
  currentCueIndex: number;
  currentPageIndex: number;
  previousCueIndex?: number;
  previousCueTotal?: number;
}

export interface FlowNavigationResult {
  pageIndex: number;
  cueIndex: number;
}

export function clampCueIndex(next: number, total?: number) {
  if (total === undefined) return Math.max(next, 0);

  return Math.min(Math.max(next, 0), Math.max(total, 0));
}

export function canAdvanceFlow({
  currentCueIndex,
  currentCueTotal,
  currentPageIndex,
  totalPages,
}: AdvanceFlowInput) {
  return currentCueIndex < currentCueTotal || currentPageIndex < totalPages - 1;
}

export function canRetreatFlow({
  currentCueIndex,
  currentPageIndex,
}: Pick<RetreatFlowInput, "currentCueIndex" | "currentPageIndex">) {
  return currentCueIndex > 0 || currentPageIndex > 0;
}

export function resolveAdvanceFlow({
  currentCueIndex,
  currentCueTotal,
  currentPageIndex,
  totalPages,
}: AdvanceFlowInput): FlowNavigationResult | null {
  if (currentCueIndex < currentCueTotal) {
    return {
      pageIndex: currentPageIndex,
      cueIndex: currentCueIndex + 1,
    };
  }

  if (currentPageIndex >= totalPages - 1) return null;

  return {
    pageIndex: currentPageIndex + 1,
    cueIndex: 0,
  };
}

export function resolveRetreatFlow({
  currentCueIndex,
  currentPageIndex,
  previousCueIndex,
  previousCueTotal,
}: RetreatFlowInput): FlowNavigationResult | null {
  if (currentCueIndex > 0) {
    return {
      pageIndex: currentPageIndex,
      cueIndex: currentCueIndex - 1,
    };
  }

  if (currentPageIndex <= 0) return null;

  return {
    pageIndex: currentPageIndex - 1,
    cueIndex: previousCueIndex ?? previousCueTotal ?? 0,
  };
}
