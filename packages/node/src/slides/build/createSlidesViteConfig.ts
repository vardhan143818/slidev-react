import { createRequire } from "node:module";
import path from "node:path";
import react from "@vitejs/plugin-react";
import type { UserConfig } from "vite";
import {
  generatedSlidesAlias,
  generatedSlidesEntry,
  pluginCompileTimeSlides,
} from "./generateCompiledSlides.ts";
import { pluginTheme } from "./themePlugin.ts";
import { pluginVirtualEntry } from "./virtualEntryPlugin.ts";
import { resolveSlidesSourceFile } from "./slidesSourceFile.ts";

const require = createRequire(import.meta.url);

/**
 * Resolve the `src/` directory of a workspace or npm package.
 * Works both inside the monorepo (workspace links) and for published packages.
 */
function resolvePackageSrcDir(pkgName: string) {
  const pkgJsonPath = require.resolve(`${pkgName}/package.json`);
  return path.join(path.dirname(pkgJsonPath), "src");
}

export function createSlidesViteConfig(options: {
  appRoot: string;
  slidesFile?: string;
}): UserConfig {
  const { appRoot, slidesFile } = options;
  const slidesSourceFile = resolveSlidesSourceFile(appRoot, slidesFile);
  const clientSrcDir = resolvePackageSrcDir("@slidev-react/client");

  return {
    root: appRoot,
    plugins: [
      pluginVirtualEntry({
        slidesSourceFile,
        clientEntryPath: "@slidev-react/client",
      }),
      pluginCompileTimeSlides({
        appRoot,
        slidesSourceFile,
      }),
      pluginTheme({
        slidesSourceFile,
      }),
      react(),
    ],
    resolve: {
      alias: {
        "@": clientSrcDir,
        [generatedSlidesAlias]: path.resolve(appRoot, generatedSlidesEntry),
      },
    },
  };
}

