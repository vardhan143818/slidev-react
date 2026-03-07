import { MDXProvider } from "@mdx-js/react";
import compiledSlides from "@generated/slides";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SlidesProvider } from "./providers/SlidesProvider";
import { AddonProvider, useSlideAddons } from "../addons/AddonProvider";
import { PrintSlidesView } from "../features/presentation/PrintSlidesView";
import { PresenterShell } from "../features/presentation/presenter/PresenterShell";
import {
  buildSlidesUrl,
  resolvePresentationExportMode,
  resolvePrintExportWithClicks,
} from "@slidev-react/core/presentation/export/urls";
import { resolvePresentationFileNameBase } from "../features/presentation/recordingFilename";
import {
  resolvePresentationSession,
  type PresentationSession,
  updateSyncModeInUrl,
} from "../features/presentation/session";
import type { PresentationSyncMode } from "../features/presentation/types";
import { ThemeProvider, useSlideTheme } from "../theme/ThemeProvider";
import type { MDXComponents } from "../types/mdx-components";

function ThemeBoundApp({
  exportMode,
  exportWithClicks,
  exportBaseName,
  slidesDocument,
  drawStorageKey,
  presentationSession,
  handleSyncModeChange,
}: {
  exportMode: "print" | null;
  exportWithClicks: boolean;
  exportBaseName: string;
  slidesDocument: typeof compiledSlides;
  drawStorageKey: string;
  presentationSession: PresentationSession;
  handleSyncModeChange: (mode: PresentationSyncMode) => void;
}) {
  const theme = useSlideTheme();
  const addons = useSlideAddons();
  const mdxComponents = useMemo<MDXComponents>(
    () => ({
      ...theme.mdxComponents,
      ...addons.mdxComponents,
    }),
    [addons.mdxComponents, theme.mdxComponents],
  );
  const runtimeProviders = useMemo(
    () =>
      [theme.provider, ...addons.providers].filter(
        (provider): provider is NonNullable<typeof provider> => Boolean(provider),
      ),
    [addons.providers, theme.provider],
  );

  const content =
    exportMode === "print" ? (
      <PrintSlidesView
        slides={slidesDocument.slides}
        slidesTitle={slidesDocument.meta.title}
        slidesViewport={slidesDocument.meta.viewport}
        slidesLayout={slidesDocument.meta.layout}
        slidesBackground={slidesDocument.meta.background}
        exportBaseName={exportBaseName}
        withClicks={exportWithClicks}
        onBack={() => {
          window.location.assign(buildSlidesUrl(window.location.href));
        }}
      />
    ) : (
      <SlidesProvider total={slidesDocument.slides.length}>
        <PresenterShell
          slides={slidesDocument.slides}
          slidesTitle={slidesDocument.meta.title}
          slidesViewport={slidesDocument.meta.viewport}
          slidesLayout={slidesDocument.meta.layout}
          slidesBackground={slidesDocument.meta.background}
          slidesTransition={slidesDocument.meta.transition}
          slidesExportFilename={slidesDocument.meta.exportFilename}
          slidesSessionSeed={slidesDocument.sourceHash}
          drawStorageKey={drawStorageKey}
          session={presentationSession}
          onSyncModeChange={handleSyncModeChange}
        />
      </SlidesProvider>
    );

  return (
    <MDXProvider components={mdxComponents}>
      {runtimeProviders.reduceRight(
        (children, Provider) => (
          <Provider>{children}</Provider>
        ),
        content,
      )}
    </MDXProvider>
  );
}

export default function App() {
  const slidesDocument = compiledSlides;
  const exportMode = useMemo(
    () =>
      typeof window === "undefined" ? null : resolvePresentationExportMode(window.location.search),
    [],
  );
  const exportWithClicks = useMemo(
    () =>
      typeof window === "undefined" ? false : resolvePrintExportWithClicks(window.location.search),
    [],
  );
  const slidesHash = useMemo(() => slidesDocument.sourceHash, [slidesDocument.sourceHash]);
  const drawStorageKey = useMemo(() => `slide-react:draw:${slidesHash}`, [slidesHash]);
  const exportBaseName = useMemo(
    () =>
      resolvePresentationFileNameBase({
        exportFilename: slidesDocument.meta.exportFilename,
        slidesTitle: slidesDocument.meta.title,
      }),
    [slidesDocument.meta.exportFilename, slidesDocument.meta.title],
  );
  const sessionBase = useMemo<PresentationSession>(() => {
    if (exportMode === "print") {
      return {
        enabled: false,
        role: "standalone",
        syncMode: "off",
        sessionId: null,
        senderId: "print-export",
        wsUrl: null,
        presenterUrl: null,
        viewerUrl: null,
      };
    }

    return resolvePresentationSession(slidesHash);
  }, [slidesHash, exportMode]);
  const [syncMode, setSyncMode] = useState<PresentationSyncMode>(sessionBase.syncMode);
  const presentationSession = useMemo<PresentationSession>(
    () => ({
      ...sessionBase,
      syncMode,
    }),
    [sessionBase, syncMode],
  );

  useEffect(() => {
    setSyncMode(sessionBase.syncMode);
  }, [sessionBase.syncMode]);

  useEffect(() => {
    document.title =
      exportMode === "print"
        ? `${exportBaseName}.pdf`
        : (slidesDocument.meta.title ?? "Slide React MVP");
  }, [slidesDocument.meta.title, exportBaseName, exportMode]);

  useEffect(() => {
    const mode = exportMode === "print" ? "print" : "live";
    document.documentElement.dataset.presentationMode = mode;
    return () => {
      delete document.documentElement.dataset.presentationMode;
    };
  }, [exportMode]);

  const handleSyncModeChange = useCallback((mode: PresentationSyncMode) => {
    setSyncMode(mode);
    updateSyncModeInUrl(mode);
  }, []);

  return (
    <ThemeProvider themeId={slidesDocument.meta.theme}>
      <AddonProvider addonIds={slidesDocument.meta.addons}>
        <ThemeBoundApp
          exportMode={exportMode}
          exportWithClicks={exportWithClicks}
          exportBaseName={exportBaseName}
          slidesDocument={slidesDocument}
          drawStorageKey={drawStorageKey}
          presentationSession={presentationSession}
          handleSyncModeChange={handleSyncModeChange}
        />
      </AddonProvider>
    </ThemeProvider>
  );
}
