import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveCueTotal } from "@slidev-react/core/presentation/flow/cue";
import {
  canAdvanceFlow,
  canRetreatFlow,
  clampCueIndex,
  resolveAdvanceFlow,
  resolveRetreatFlow,
} from "@slidev-react/core/presentation/flow/navigation";
import { type RevealContextValue } from "../reveal/RevealContext";
import type { CompiledSlide } from "./types";

interface SlidesNavigationLike {
  currentIndex: number;
  total: number;
  goTo: (index: number) => void;
}

function resolveMaxCueStep(stepCounts: Map<number, number> | undefined) {
  if (!stepCounts || stepCounts.size === 0) return 0;

  let max = 0;
  for (const step of stepCounts.keys()) {
    if (step > max) max = step;
  }

  return max;
}

export function usePresentationFlowRuntime({
  slides,
  navigation,
}: {
  slides: CompiledSlide[];
  navigation: SlidesNavigationLike;
}) {
  const currentSlide = slides[navigation.currentIndex];
  const revealStepCountsRef = useRef<Record<string, Map<number, number>>>({});
  const [clicksBySlideId, setClicksBySlideId] = useState<Record<string, number>>({});
  const [clicksTotalBySlideId, setClicksTotalBySlideId] = useState<Record<string, number>>({});
  const clicksBySlideIdRef = useRef(clicksBySlideId);
  const clicksTotalBySlideIdRef = useRef(clicksTotalBySlideId);
  const slideClicksConfig = useMemo(
    () =>
      Object.fromEntries(
        slides.map((slide) => [slide.id, slide.meta.clicks ?? 0] as const),
      ) as Record<string, number>,
    [slides],
  );

  useEffect(() => {
    clicksBySlideIdRef.current = clicksBySlideId;
  }, [clicksBySlideId]);

  useEffect(() => {
    clicksTotalBySlideIdRef.current = clicksTotalBySlideId;
  }, [clicksTotalBySlideId]);

  const setSlideClicks = useCallback(
    (slideId: string, next: number) => {
      setClicksBySlideId((prev) => {
        const total = resolveCueTotal({
          configuredCues: slideClicksConfig[slideId],
          detectedCues: clicksTotalBySlideIdRef.current[slideId],
        });
        const clamped = clampCueIndex(next, total);
        if ((prev[slideId] ?? 0) === clamped) return prev;

        const updated = {
          ...prev,
          [slideId]: clamped,
        };
        clicksBySlideIdRef.current = updated;
        return updated;
      });
    },
    [slideClicksConfig],
  );

  const setSlideClicksTotal = useCallback(
    (slideId: string, nextTotal: number) => {
      const safeTotal = resolveCueTotal({
        configuredCues: slideClicksConfig[slideId],
        detectedCues: nextTotal,
      });

      setClicksTotalBySlideId((prev) => {
        if (prev[slideId] === safeTotal) return prev;

        const updated = {
          ...prev,
          [slideId]: safeTotal,
        };
        clicksTotalBySlideIdRef.current = updated;
        return updated;
      });

      setClicksBySlideId((prev) => {
        const clamped = clampCueIndex(prev[slideId] ?? 0, safeTotal);
        if ((prev[slideId] ?? 0) === clamped) return prev;

        const updated = {
          ...prev,
          [slideId]: clamped,
        };
        clicksBySlideIdRef.current = updated;
        return updated;
      });
    },
    [slideClicksConfig],
  );

  const registerRevealStep = useCallback(
    (step: number) => {
      const slideId = currentSlide.id;
      const normalizedStep = Math.max(Math.floor(step), 1);
      const slideSteps = revealStepCountsRef.current[slideId] ?? new Map<number, number>();
      revealStepCountsRef.current[slideId] = slideSteps;
      slideSteps.set(normalizedStep, (slideSteps.get(normalizedStep) ?? 0) + 1);
      setSlideClicksTotal(slideId, resolveMaxCueStep(slideSteps));

      return () => {
        const steps = revealStepCountsRef.current[slideId];
        if (!steps) return;

        const nextCount = (steps.get(normalizedStep) ?? 1) - 1;
        if (nextCount <= 0) steps.delete(normalizedStep);
        else steps.set(normalizedStep, nextCount);

        if (steps.size === 0) delete revealStepCountsRef.current[slideId];

        setSlideClicksTotal(slideId, resolveMaxCueStep(steps));
      };
    },
    [currentSlide.id, setSlideClicksTotal],
  );

  const currentClicks = clicksBySlideId[currentSlide.id] ?? 0;
  const currentClicksTotal = resolveCueTotal({
    configuredCues: currentSlide.meta.clicks,
    detectedCues: clicksTotalBySlideId[currentSlide.id],
  });

  const goToSlideAtStart = useCallback(
    (index: number) => {
      const targetSlide = slides[index];
      if (!targetSlide) return;

      setSlideClicks(targetSlide.id, 0);
      navigation.goTo(index);
    },
    [navigation, setSlideClicks, slides],
  );

  const advanceReveal = useCallback(() => {
    const nextState = resolveAdvanceFlow({
      currentCueIndex: currentClicks,
      currentCueTotal: currentClicksTotal,
      currentPageIndex: navigation.currentIndex,
      totalPages: navigation.total,
    });
    if (!nextState) return;

    const targetSlide = slides[nextState.pageIndex];
    if (!targetSlide) return;

    setSlideClicks(targetSlide.id, nextState.cueIndex);
    if (nextState.pageIndex !== navigation.currentIndex) navigation.goTo(nextState.pageIndex);
  }, [currentClicks, currentClicksTotal, navigation, setSlideClicks, slides]);

  const retreatReveal = useCallback(() => {
    const previousSlideId = slides[navigation.currentIndex - 1]?.id ?? "";
    const nextState = resolveRetreatFlow({
      currentCueIndex: currentClicks,
      currentPageIndex: navigation.currentIndex,
      previousCueIndex: clicksBySlideIdRef.current[previousSlideId],
      previousCueTotal: resolveCueTotal({
        configuredCues: slideClicksConfig[previousSlideId],
        detectedCues: clicksTotalBySlideIdRef.current[previousSlideId],
      }),
    });
    if (!nextState) return;

    const targetSlide = slides[nextState.pageIndex];
    if (!targetSlide) return;

    setSlideClicks(targetSlide.id, nextState.cueIndex);
    if (nextState.pageIndex !== navigation.currentIndex) navigation.goTo(nextState.pageIndex);
  }, [currentClicks, navigation, setSlideClicks, slideClicksConfig, slides]);

  const revealContextValue = useMemo<RevealContextValue>(
    () => ({
      slideId: currentSlide.id,
      clicks: currentClicks,
      clicksTotal: currentClicksTotal,
      setClicks: (next) => setSlideClicks(currentSlide.id, next),
      registerStep: registerRevealStep,
      advance: advanceReveal,
      retreat: retreatReveal,
      canAdvance: canAdvanceFlow({
        currentCueIndex: currentClicks,
        currentCueTotal: currentClicksTotal,
        currentPageIndex: navigation.currentIndex,
        totalPages: navigation.total,
      }),
      canRetreat: canRetreatFlow({
        currentCueIndex: currentClicks,
        currentPageIndex: navigation.currentIndex,
      }),
    }),
    [
      advanceReveal,
      currentClicks,
      currentClicksTotal,
      currentSlide.id,
      navigation.currentIndex,
      navigation.total,
      registerRevealStep,
      retreatReveal,
      setSlideClicks,
    ],
  );

  return {
    currentClicks,
    currentClicksTotal,
    canPrev: revealContextValue.canRetreat,
    canNext: revealContextValue.canAdvance,
    revealContextValue,
    setSlideClicks,
    setSlideClicksTotal,
    goToSlideAtStart,
    advanceReveal,
    retreatReveal,
  }
}

export type PresentationFlowRuntime = ReturnType<typeof usePresentationFlowRuntime>
