import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { LayoutName } from "@slidev-react/core/slides/layout";
import type { SlidesViewport } from "@slidev-react/core/slides/viewport";
import type { TransitionName } from "@slidev-react/core/slides/transition";
import { DrawProvider, type DrawStroke } from "../draw/DrawProvider";
import { KeyboardController } from "../navigation/KeyboardController";
import { ShortcutsHelpOverlay } from "../navigation/ShortcutsHelpOverlay";
import {
  buildShortcutHelpSections,
  createShortcutHelpTriggerState,
  isShortcutHelpOpenKey,
  registerShortcutHelpKeyDown,
  registerShortcutHelpKeyUp,
} from "../navigation/keyboardShortcuts";
import { NotesOverview } from "../overview/NotesOverview";
import { PresentationNavbar } from "../navigation/PresentationNavbar";
import { useSlidesNavigation } from "../navigation/useSlidesNavigation";
import { QuickOverview } from "../overview/QuickOverview";
import { SlideStage } from "../stage/SlideStage";
import { PresentationStatus } from "../PresentationStatus";
import { buildPrintExportUrl } from "@slidev-react/core/presentation/export/urls";
import { buildPresentationEntryUrl, type PresentationSession } from "../session";
import { usePresentationRecorder } from "../usePresentationRecorder";
import { usePresentationSync } from "../usePresentationSync";
import type {
  PresentationCursorState,
  PresentationSharedState,
  PresentationSyncMode,
} from "../types";
import { resolveCueTotal } from "@slidev-react/core/presentation/flow/cue";
import {
  canAdvanceFlow,
  canRetreatFlow,
  clampCueIndex,
  resolveAdvanceFlow,
  resolveRetreatFlow,
} from "@slidev-react/core/presentation/flow/navigation";
import { RevealProvider, type RevealContextValue } from "../reveal/RevealContext";
import { SpeakerNotesPanel } from "./SpeakerNotesPanel";
import { FlowTimelinePreview } from "./FlowTimelinePreview";
import { PresenterSidePreview } from "./PresenterSidePreview";
import { PresenterTopProgress } from "./PresenterTopProgress";
import type { CompiledSlide } from "./types";
import { useWakeLock } from "./useWakeLock";
import { useFullscreen } from "./useFullscreen";
import { useIdleCursor } from "./useIdleCursor";

function isTypingElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function canControlNavigation(session: PresentationSession) {
  return !session.enabled || session.role === "presenter";
}

const PRESENTER_STAGE_SCALE_STORAGE_KEY = "slide-react:presenter-stage-scale";
const PRESENTER_STAGE_SCALE_OPTIONS = new Set([0.9, 1, 1.08]);
const PRESENTER_CURSOR_MODE_STORAGE_KEY = "slide-react:presenter-cursor-mode";
const PRESENTER_CURSOR_MODE_OPTIONS = new Set(["always", "idle-hide"] as const);
const PRESENTER_SIDEBAR_WIDTH_STORAGE_KEY = "slide-react:presenter-sidebar-width";
const PRESENTER_SIDEBAR_WIDTH_MIN = 280;
const PRESENTER_SIDEBAR_WIDTH_MAX = 420;
const PRESENTER_STAGE_MIN_WIDTH = 720;
const PRESENTER_DIVIDER_WIDTH = 10;
const PRESENTER_BOTTOM_BAR_CLEARANCE = 72;
const PRESENTER_DESKTOP_BREAKPOINT = 1024;

type PresenterCursorMode = "always" | "idle-hide";

function readInitialStageScale() {
  if (typeof window === "undefined") return 1;

  try {
    const savedValue = window.localStorage.getItem(PRESENTER_STAGE_SCALE_STORAGE_KEY);
    if (!savedValue) return 1;

    const parsedValue = Number(savedValue);
    if (!Number.isFinite(parsedValue) || !PRESENTER_STAGE_SCALE_OPTIONS.has(parsedValue)) return 1;

    return parsedValue;
  } catch {
    return 1;
  }
}

function readInitialCursorMode(): PresenterCursorMode {
  if (typeof window === "undefined") return "always";

  try {
    const savedValue = window.localStorage.getItem(PRESENTER_CURSOR_MODE_STORAGE_KEY);
    if (!savedValue) return "always";

    return PRESENTER_CURSOR_MODE_OPTIONS.has(savedValue as PresenterCursorMode)
      ? (savedValue as PresenterCursorMode)
      : "always";
  } catch {
    return "always";
  }
}

function clampPresenterSidebarWidth(value: number, containerWidth: number) {
  const maxWidth = Math.min(
    PRESENTER_SIDEBAR_WIDTH_MAX,
    Math.max(
      PRESENTER_SIDEBAR_WIDTH_MIN,
      containerWidth - PRESENTER_STAGE_MIN_WIDTH - PRESENTER_DIVIDER_WIDTH,
    ),
  );

  return Math.min(Math.max(Math.round(value), PRESENTER_SIDEBAR_WIDTH_MIN), maxWidth);
}

function readInitialSidebarWidth() {
  if (typeof window === "undefined") return 300;

  try {
    const savedValue = window.localStorage.getItem(PRESENTER_SIDEBAR_WIDTH_STORAGE_KEY);
    if (savedValue) {
      const parsedValue = Number(savedValue);
      if (Number.isFinite(parsedValue))
        return clampPresenterSidebarWidth(parsedValue, window.innerWidth);
    }
  } catch {
    // Ignore storage read failures.
  }

  return clampPresenterSidebarWidth(window.innerWidth * 0.23, window.innerWidth);
}

function resolveMaxCueStep(stepCounts: Map<number, number> | undefined) {
  if (!stepCounts || stepCounts.size === 0) return 0;

  let max = 0;
  for (const step of stepCounts.keys()) {
    if (step > max) max = step;
  }

  return max;
}

type PresenterOverlay =
  | "quick-overview"
  | "notes-overview"
  | "timeline-preview"
  | "shortcuts-help"
  | null;

export function PresenterShell({
  slides,
  slidesTitle,
  slidesViewport,
  slidesLayout,
  slidesBackground,
  slidesTransition,
  slidesExportFilename,
  slidesSessionSeed,
  drawStorageKey,
  session,
  onSyncModeChange,
}: {
  slides: CompiledSlide[];
  slidesTitle?: string;
  slidesViewport: SlidesViewport;
  slidesLayout?: LayoutName;
  slidesBackground?: string;
  slidesTransition?: TransitionName;
  slidesExportFilename?: string;
  slidesSessionSeed: string;
  drawStorageKey: string;
  session: PresentationSession;
  onSyncModeChange: (mode: PresentationSyncMode) => void;
}) {
  const navigation = useSlidesNavigation();
  const currentSlide = slides[navigation.currentIndex];
  const nextSlide = slides[navigation.currentIndex + 1] ?? null;
  const CurrentSlide = currentSlide.component;
  const [activeOverlay, setActiveOverlay] = useState<PresenterOverlay>(null);
  const canControl = canControlNavigation(session);
  const isPresenterRole = session.role === "presenter";
  const [followPresenter, setFollowPresenter] = useState(session.role === "viewer");
  const [localCursor, setLocalCursor] = useState<PresentationCursorState | null>(null);
  const [remoteCursor, setRemoteCursor] = useState<PresentationCursorState | null>(null);
  const [remotePageIndex, setRemotePageIndex] = useState<number | null>(null);
  const [localTimer, setLocalTimer] = useState(0);
  const [remoteTimer, setRemoteTimer] = useState(0);
  const [drawings, setDrawings] = useState<Record<string, DrawStroke[]>>({});
  const [drawingsRevision, setDrawingsRevision] = useState(0);
  const [remoteDrawings, setRemoteDrawings] = useState<{
    revision: number;
    strokesBySlideId: Record<string, DrawStroke[]>;
  } | null>(null);
  const drawingsSyncFrameRef = useRef<number | null>(null);
  const currentIndexRef = useRef(navigation.currentIndex);
  const revealStepCountsRef = useRef<Record<string, Map<number, number>>>({});
  const [clicksBySlideId, setClicksBySlideId] = useState<Record<string, number>>({});
  const [clicksTotalBySlideId, setClicksTotalBySlideId] = useState<Record<string, number>>({});
  const [stageScale, setStageScale] = useState(readInitialStageScale);
  const [cursorMode, setCursorMode] = useState<PresenterCursorMode>(readInitialCursorMode);
  const [sidebarWidth, setSidebarWidth] = useState(readInitialSidebarWidth);
  const [isWidePresenterLayout, setIsWidePresenterLayout] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= PRESENTER_DESKTOP_BREAKPOINT : false,
  );
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const clicksBySlideIdRef = useRef(clicksBySlideId);
  const clicksTotalBySlideIdRef = useRef(clicksTotalBySlideId);
  const shortcutHelpTriggerRef = useRef(createShortcutHelpTriggerState());
  const presenterLayoutRef = useRef<HTMLDivElement | null>(null);
  const wakeLock = useWakeLock();
  const fullscreen = useFullscreen();
  const slideClicksConfig = useMemo(
    () =>
      Object.fromEntries(
        slides.map((slide) => [slide.id, slide.meta.clicks ?? 0] as const),
      ) as Record<string, number>,
    [slides],
  );

  useEffect(() => {
    currentIndexRef.current = navigation.currentIndex;
  }, [navigation.currentIndex]);

  useEffect(() => {
    setFollowPresenter(session.role === "viewer");
  }, [session.role, session.sessionId]);

  useEffect(() => {
    setRemotePageIndex(navigation.currentIndex);
  }, [session.role, session.sessionId]);

  useEffect(() => {
    clicksBySlideIdRef.current = clicksBySlideId;
  }, [clicksBySlideId]);

  useEffect(() => {
    clicksTotalBySlideIdRef.current = clicksTotalBySlideId;
  }, [clicksTotalBySlideId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(PRESENTER_STAGE_SCALE_STORAGE_KEY, String(stageScale));
    } catch {
      // Ignore storage write failures.
    }
  }, [stageScale]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(PRESENTER_CURSOR_MODE_STORAGE_KEY, cursorMode);
    } catch {
      // Ignore storage write failures.
    }
  }, [cursorMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(PRESENTER_SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidth));
    } catch {
      // Ignore storage write failures.
    }
  }, [sidebarWidth]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updatePresenterLayoutMode = () => {
      setIsWidePresenterLayout(window.innerWidth >= PRESENTER_DESKTOP_BREAKPOINT);

      const containerWidth =
        presenterLayoutRef.current?.getBoundingClientRect().width ?? window.innerWidth;
      setSidebarWidth((currentWidth) => clampPresenterSidebarWidth(currentWidth, containerWidth));
    };

    updatePresenterLayoutMode();
    window.addEventListener("resize", updatePresenterLayoutMode);
    return () => window.removeEventListener("resize", updatePresenterLayoutMode);
  }, []);

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
  }, [currentClicks, navigation, setSlideClicks, slides]);

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

  const scheduleDrawingsSync = useCallback(() => {
    if (drawingsSyncFrameRef.current !== null) return;

    drawingsSyncFrameRef.current = window.requestAnimationFrame(() => {
      drawingsSyncFrameRef.current = null;
      setDrawingsRevision((revision) => revision + 1);
    });
  }, []);

  const onStrokesChange = useCallback(
    (nextStrokes: Record<string, DrawStroke[]>) => {
      setDrawings(nextStrokes);

      if (!canControl) return;

      scheduleDrawingsSync();
    },
    [canControl, scheduleDrawingsSync],
  );

  const localSharedState = useMemo<PresentationSharedState>(
    () => ({
      page: navigation.currentIndex,
      clicks: currentClicks,
      clicksTotal: currentClicksTotal,
      timer: localTimer,
      cursor: localCursor,
      drawings,
      drawingsRevision,
      lastUpdate: 0,
    }),
    [
      currentClicks,
      currentClicksTotal,
      drawings,
      drawingsRevision,
      localCursor,
      localTimer,
      navigation.currentIndex,
    ],
  );

  const sync = usePresentationSync({
    session,
    currentIndex: navigation.currentIndex,
    total: navigation.total,
    goTo: navigation.goTo,
    followRemotePage: followPresenter,
    localState: localSharedState,
    onRemoteState: (patch, remotePage) => {
      setRemotePageIndex(remotePage);
      const remoteIndex = remotePage;
      const remoteSlide = slides[remoteIndex];

      if (typeof patch.timer === "number") setRemoteTimer(patch.timer);

      if ("cursor" in patch) {
        setRemoteCursor(remoteIndex === currentIndexRef.current ? (patch.cursor ?? null) : null);
      }

      if (remoteSlide && typeof patch.clicksTotal === "number")
        setSlideClicksTotal(remoteSlide.id, patch.clicksTotal);

      if (remoteSlide && typeof patch.clicks === "number")
        setSlideClicks(remoteSlide.id, patch.clicks);

      if (patch.drawings) {
        setRemoteDrawings({
          revision:
            typeof patch.drawingsRevision === "number" ? patch.drawingsRevision : Date.now(),
          strokesBySlideId: patch.drawings,
        });
      }
    },
  });

  const recorder = usePresentationRecorder({
    enabled: canControl,
    exportFilename: slidesExportFilename,
    slidesTitle,
  });

  const detachFromPresenter = useCallback(() => {
    if (session.role !== "viewer") return;

    setFollowPresenter(false);
  }, [session.role]);

  const handleViewerAdvance = useCallback(() => {
    detachFromPresenter();
    advanceReveal();
  }, [advanceReveal, detachFromPresenter]);

  const handleViewerRetreat = useCallback(() => {
    detachFromPresenter();
    retreatReveal();
  }, [detachFromPresenter, retreatReveal]);

  const handleViewerFirst = useCallback(() => {
    detachFromPresenter();
    goToSlideAtStart(0);
  }, [detachFromPresenter, goToSlideAtStart]);

  const handleViewerLast = useCallback(() => {
    detachFromPresenter();
    goToSlideAtStart(Math.max(navigation.total - 1, 0));
  }, [detachFromPresenter, goToSlideAtStart, navigation.total]);

  const handleEnterPresenterMode = useCallback(() => {
    const entryUrl = buildPresentationEntryUrl("presenter", slidesSessionSeed);
    if (!entryUrl) return;

    window.location.assign(entryUrl);
  }, [slidesSessionSeed]);

  const handleOpenPrintExport = useCallback(() => {
    const exportUrl = buildPrintExportUrl(window.location.href);
    const exportWindow = window.open(exportUrl, "_blank");
    if (exportWindow) {
      exportWindow.opener = null;
      return;
    }

    window.location.assign(exportUrl);
  }, []);

  const handleOpenMirrorStage = useCallback(() => {
    const targetUrl = session.viewerUrl;
    if (!targetUrl) return;

    const mirrorWindow = window.open(targetUrl, "_blank", "noopener,noreferrer");
    if (mirrorWindow) {
      mirrorWindow.opener = null;
      return;
    }

    window.location.assign(targetUrl);
  }, [session.viewerUrl]);

  const handleStageScaleChange = useCallback((value: number) => {
    setStageScale(PRESENTER_STAGE_SCALE_OPTIONS.has(value) ? value : 1);
  }, []);

  const handleCursorModeChange = useCallback((value: PresenterCursorMode) => {
    setCursorMode(PRESENTER_CURSOR_MODE_OPTIONS.has(value) ? value : "always");
  }, []);

  const hideCursor = useIdleCursor({
    enabled: isPresenterRole && canControl && cursorMode === "idle-hide",
  });

  const canPrev = revealContextValue.canRetreat;
  const canNext = revealContextValue.canAdvance;
  const canOpenOverview = canControl || session.role === "viewer";
  const overviewOpen = activeOverlay === "quick-overview";
  const notesOverviewOpen = activeOverlay === "notes-overview";
  const shortcutsHelpOpen = activeOverlay === "shortcuts-help";
  const shortcutHelpSections = useMemo(
    () =>
      buildShortcutHelpSections({
        canControl,
        canOpenOverview,
      }),
    [canControl, canOpenOverview],
  );
  const progressPercent =
    navigation.total > 0 ? ((navigation.currentIndex + 1) / navigation.total) * 100 : 0;
  useEffect(() => {
    if (!canControl) {
      setLocalTimer(0);
      return;
    }

    const startedAt = Date.now();
    setLocalTimer(0);
    const intervalId = window.setInterval(() => {
      setLocalTimer(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [canControl, session.sessionId]);

  useEffect(() => {
    if (canControl) {
      setRemoteCursor(null);
      setRemoteTimer(0);
      setRemoteDrawings(null);
      return;
    }

    setLocalCursor(null);
    setActiveOverlay(null);
  }, [canControl]);

  useEffect(() => {
    if (remotePageIndex === navigation.currentIndex) return;

    setRemoteCursor(null);
  }, [navigation.currentIndex, remotePageIndex]);

  useEffect(() => {
    return () => {
      if (drawingsSyncFrameRef.current !== null)
        window.cancelAnimationFrame(drawingsSyncFrameRef.current);
    };
  }, []);

  const setSidebarWidthFromPointer = useCallback((clientX: number) => {
    const bounds = presenterLayoutRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const nextWidth = clampPresenterSidebarWidth(bounds.right - clientX, bounds.width);
    setSidebarWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
  }, []);

  useEffect(() => {
    if (!isResizingSidebar) return;

    const handlePointerMove = (event: PointerEvent) => {
      setSidebarWidthFromPointer(event.clientX);
    };

    const handlePointerUp = () => {
      setIsResizingSidebar(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingSidebar, setSidebarWidthFromPointer]);

  const handleSidebarResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;

      event.preventDefault();
      setSidebarWidthFromPointer(event.clientX);
      setIsResizingSidebar(true);
    },
    [setSidebarWidthFromPointer],
  );

  const handleSidebarResizeKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!isWidePresenterLayout) return;

      let delta = 0;
      if (event.key === "ArrowLeft") delta = 16;
      if (event.key === "ArrowRight") delta = -16;
      if (event.key === "Home") delta = PRESENTER_SIDEBAR_WIDTH_MIN - sidebarWidth;
      if (event.key === "End") delta = PRESENTER_SIDEBAR_WIDTH_MAX - sidebarWidth;
      if (!delta) return;

      event.preventDefault();
      const containerWidth =
        presenterLayoutRef.current?.getBoundingClientRect().width ?? window.innerWidth;
      setSidebarWidth((currentWidth) =>
        clampPresenterSidebarWidth(currentWidth + delta, containerWidth),
      );
    },
    [isWidePresenterLayout, sidebarWidth],
  );

  const presenterLayoutStyle = useMemo(
    () =>
      isWidePresenterLayout
        ? {
            gridTemplateColumns: `minmax(0, 1fr) ${PRESENTER_DIVIDER_WIDTH}px ${sidebarWidth}px`,
          }
        : undefined,
    [isWidePresenterLayout, sidebarWidth],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingElement(event.target)) return;

      if (!event.repeat) {
        shortcutHelpTriggerRef.current = registerShortcutHelpKeyDown(
          shortcutHelpTriggerRef.current,
          event.key,
        );
      }

      const key = event.key.toLowerCase();

      if (
        isShortcutHelpOpenKey({
          key: event.key,
          shiftKey: event.shiftKey,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
        })
      ) {
        event.preventDefault();
        setActiveOverlay((value) => (value === "shortcuts-help" ? null : "shortcuts-help"));
        return;
      }

      if (key === "o") {
        if (!canOpenOverview) return;

        event.preventDefault();
        setActiveOverlay((value) => (value === "quick-overview" ? null : "quick-overview"));
        return;
      }

      if (key === "n") {
        if (!canControl) return;

        event.preventDefault();
        setActiveOverlay((value) => (value === "notes-overview" ? null : "notes-overview"));
        return;
      }

      if (key === "escape") setActiveOverlay(null);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (isTypingElement(event.target)) return;

      const result = registerShortcutHelpKeyUp(
        shortcutHelpTriggerRef.current,
        event.key,
        Date.now(),
      );
      shortcutHelpTriggerRef.current = result.nextState;

      if (!result.shouldToggle) return;

      setActiveOverlay((value) => (value === "shortcuts-help" ? null : "shortcuts-help"));
    };

    const onBlur = () => {
      shortcutHelpTriggerRef.current = createShortcutHelpTriggerState();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [canControl, canOpenOverview]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.body.dataset.presenterOverlay = activeOverlay ? "open" : "closed";
    return () => {
      delete document.body.dataset.presenterOverlay;
    };
  }, [activeOverlay]);

  return (
    <>
      <RevealProvider value={revealContextValue}>
        <KeyboardController
          enabled={canControl || session.role === "viewer"}
          onAdvance={!canControl ? handleViewerAdvance : undefined}
          onRetreat={!canControl ? handleViewerRetreat : undefined}
          onFirst={!canControl ? handleViewerFirst : undefined}
          onLast={!canControl ? handleViewerLast : undefined}
        />
      </RevealProvider>
      <DrawProvider
        currentSlideId={currentSlide.id}
        storageKey={drawStorageKey}
        readOnly={!canControl}
        remoteStrokes={canControl ? null : remoteDrawings}
        onStrokesChange={onStrokesChange}
      >
        <div
          className={`relative grid h-dvh max-h-dvh grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden ${
            isPresenterRole ? "bg-[#eef4ff]" : "bg-black"
          } ${hideCursor ? "cursor-none" : ""}`}
        >
          {isPresenterRole && (
            <>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_78%_16%,rgba(244,114,182,0.14),transparent_20%),linear-gradient(180deg,#f8fbff_0%,#e8f0fb_52%,#f3f7ff_100%)]" />
              <PresenterTopProgress total={navigation.total} progressPercent={progressPercent} />
            </>
          )}
          {isPresenterRole && (
            <PresentationStatus
              slideId={currentSlide.id}
              session={session}
              status={sync.status}
              broadcastConnected={sync.broadcastConnected}
              wsConnected={sync.wsConnected}
              lastSyncedAt={sync.lastSyncedAt}
              peerCount={sync.peerCount}
              remoteActive={sync.remoteActive}
              sessionTimerSeconds={canControl ? localTimer : remoteTimer}
              canRecord={canControl}
              recordingSupported={recorder.supported}
              isRecording={recorder.isRecording}
              recordingError={recorder.error}
              wakeLockSupported={wakeLock.supported}
              wakeLockRequested={wakeLock.requested}
              wakeLockActive={wakeLock.active}
              wakeLockError={wakeLock.error}
              fullscreenSupported={fullscreen.supported}
              fullscreenActive={fullscreen.active}
              stageScale={stageScale}
              cursorMode={cursorMode}
              timelinePreviewOpen={activeOverlay === "timeline-preview"}
              overviewOpen={overviewOpen}
              notesOpen={notesOverviewOpen}
              shortcutsOpen={shortcutsHelpOpen}
              canOpenOverview={canOpenOverview}
              onStartRecording={() => {
                void recorder.start();
              }}
              onStopRecording={() => {
                void recorder.stop();
              }}
              onToggleWakeLock={() => {
                void wakeLock.toggle();
              }}
              onToggleFullscreen={() => {
                void fullscreen.toggle();
              }}
              onToggleTimelinePreview={() => {
                setActiveOverlay((value) =>
                  value === "timeline-preview" ? null : "timeline-preview",
                );
              }}
              onToggleOverview={() => {
                if (!canOpenOverview) return;

                setActiveOverlay((value) => (value === "quick-overview" ? null : "quick-overview"));
              }}
              onToggleNotes={() => {
                if (!canControl) return;

                setActiveOverlay((value) => (value === "notes-overview" ? null : "notes-overview"));
              }}
              onToggleShortcuts={() => {
                setActiveOverlay((value) => (value === "shortcuts-help" ? null : "shortcuts-help"));
              }}
              onStageScaleChange={handleStageScaleChange}
              onCursorModeChange={handleCursorModeChange}
              onOpenMirrorStage={handleOpenMirrorStage}
              onOpenPrintExport={handleOpenPrintExport}
              onSyncModeChange={onSyncModeChange}
            />
          )}
          <div
            style={
              isPresenterRole ? { paddingBottom: `${PRESENTER_BOTTOM_BAR_CLEARANCE}px` } : undefined
            }
            className={`relative min-h-0 min-w-0 size-full ${isPresenterRole ? "px-0 pb-0 pt-0 lg:px-0" : ""}`}
          >
            {isPresenterRole ? (
              <div
                ref={presenterLayoutRef}
                style={presenterLayoutStyle}
                className="grid h-full min-h-0 grid-cols-1 gap-0"
              >
                <section className="relative min-h-0 overflow-hidden rounded-[5px] border border-slate-200/75 bg-white/42 shadow-[0_24px_80px_rgba(148,163,184,0.22)] ring-1 ring-white/50">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_38%)]" />
                  <div className="relative z-0 h-full">
                    <RevealProvider value={revealContextValue}>
                      <SlideStage
                        Slide={CurrentSlide}
                        slideId={currentSlide.id}
                        meta={currentSlide.meta}
                        slidesViewport={slidesViewport}
                        slidesLayout={slidesLayout}
                        slidesBackground={slidesBackground}
                        slidesTransition={slidesTransition}
                        remoteCursor={canControl ? null : remoteCursor}
                        onCursorChange={canControl ? setLocalCursor : undefined}
                        onStageAdvance={canControl && !activeOverlay ? advanceReveal : undefined}
                        scaleMultiplier={stageScale}
                      />
                    </RevealProvider>
                  </div>
                </section>
                <div
                  role="separator"
                  aria-label="Resize presenter sidebar"
                  aria-orientation="vertical"
                  tabIndex={0}
                  onPointerDown={handleSidebarResizeStart}
                  onKeyDown={handleSidebarResizeKeyDown}
                  className={`group relative hidden lg:block ${
                    isResizingSidebar ? "cursor-col-resize" : "cursor-col-resize"
                  }`}
                >
                  <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-200/90" />
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 transition-colors ${
                      isResizingSidebar
                        ? "bg-emerald-400/16"
                        : "bg-transparent group-hover:bg-emerald-400/10"
                    }`}
                  />
                  <div
                    className={`pointer-events-none absolute left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors ${
                      isResizingSidebar
                        ? "bg-emerald-500/70"
                        : "bg-slate-300/90 group-hover:bg-emerald-500/55"
                    }`}
                  />
                </div>
                <aside className="relative z-10 flex min-h-0 min-w-0 flex-col gap-0 text-slate-900">
                  <div className="grid min-h-0 flex-1 gap-0 lg:grid-rows-[minmax(220px,0.92fr)_12px_minmax(0,1.08fr)]">
                    <PresenterSidePreview
                      title="Up Next"
                      indexLabel={nextSlide ? String(navigation.currentIndex + 2) : "--"}
                      slide={nextSlide}
                      slidesViewport={slidesViewport}
                      slidesLayout={slidesLayout}
                      slidesBackground={slidesBackground}
                    />
                    <div className="relative flex items-center justify-center px-2" aria-hidden>
                      <div className="h-px w-full rounded-full bg-slate-200/85" />
                      <div className="absolute h-2 w-10 rounded-full bg-[radial-gradient(circle,rgba(148,163,184,0.22),transparent_72%)]" />
                    </div>
                    <SpeakerNotesPanel
                      currentClicks={currentClicks}
                      currentClicksTotal={currentClicksTotal}
                      notes={currentSlide.meta.notes}
                    />
                  </div>
                </aside>
              </div>
            ) : (
              <RevealProvider value={revealContextValue}>
                <SlideStage
                  Slide={CurrentSlide}
                  slideId={currentSlide.id}
                  meta={currentSlide.meta}
                  slidesViewport={slidesViewport}
                  slidesLayout={slidesLayout}
                  slidesBackground={slidesBackground}
                  slidesTransition={slidesTransition}
                  remoteCursor={canControl ? null : remoteCursor}
                  onCursorChange={canControl ? setLocalCursor : undefined}
                />
              </RevealProvider>
            )}
          </div>
          {isPresenterRole && activeOverlay === "timeline-preview" && (
            <div
              className="absolute inset-x-4 z-30 flex justify-center"
              style={{ bottom: `${PRESENTER_BOTTOM_BAR_CLEARANCE + 16}px` }}
            >
              <FlowTimelinePreview
                slide={currentSlide}
                currentClicks={currentClicks}
                currentClicksTotal={currentClicksTotal}
                slidesViewport={slidesViewport}
                slidesLayout={slidesLayout}
                slidesBackground={slidesBackground}
                onJumpToCue={(cueIndex) => setSlideClicks(currentSlide.id, cueIndex)}
                onClose={() => setActiveOverlay(null)}
                className="w-full max-w-[min(920px,calc(100vw-2rem))] max-h-[min(60vh,700px)]"
              />
            </div>
          )}
          {!isPresenterRole && (
            <PresentationNavbar
              slideTitle={currentSlide.meta.title}
              currentIndex={navigation.currentIndex}
              total={navigation.total}
              canPrev={canPrev}
              canNext={canNext}
              showPresenterModeButton={session.role !== "presenter"}
              overviewOpen={overviewOpen}
              notesOpen={notesOverviewOpen}
              shortcutsOpen={shortcutsHelpOpen}
              canOpenOverview={canOpenOverview}
              onEnterPresenterMode={
                session.role !== "presenter" ? handleEnterPresenterMode : undefined
              }
              onToggleOverview={() => {
                if (!canOpenOverview) return;

                setActiveOverlay((value) => (value === "quick-overview" ? null : "quick-overview"));
              }}
              onToggleNotes={() => {
                if (!canControl) return;

                setActiveOverlay((value) => (value === "notes-overview" ? null : "notes-overview"));
              }}
              onToggleShortcuts={() => {
                setActiveOverlay((value) => (value === "shortcuts-help" ? null : "shortcuts-help"));
              }}
              onPrev={retreatReveal}
              onNext={advanceReveal}
              canControl={canControl}
            />
          )}
          <QuickOverview
            open={overviewOpen && canOpenOverview}
            slides={slides}
            currentIndex={navigation.currentIndex}
            slidesViewport={slidesViewport}
            slidesLayout={slidesLayout}
            slidesBackground={slidesBackground}
            onClose={() => setActiveOverlay(null)}
            onSelect={(index) => {
              if (!canControl) detachFromPresenter();
              goToSlideAtStart(index);
              setActiveOverlay(null);
            }}
          />
          <NotesOverview
            open={notesOverviewOpen && canControl}
            slides={slides}
            currentIndex={navigation.currentIndex}
            onClose={() => setActiveOverlay(null)}
            onSelect={(index) => {
              goToSlideAtStart(index);
              setActiveOverlay(null);
            }}
          />
          <ShortcutsHelpOverlay
            open={shortcutsHelpOpen}
            sections={shortcutHelpSections}
            onClose={() => setActiveOverlay(null)}
          />
        </div>
      </DrawProvider>
    </>
  );
}
