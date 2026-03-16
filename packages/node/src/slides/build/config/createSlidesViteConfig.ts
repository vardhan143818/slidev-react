import path from "node:path";
import { createRequire } from "node:module";
import tailwindcss from "@tailwindcss/postcss";
import react from "@vitejs/plugin-react";
import type { UserConfig } from "vite";
import {
  generatedSlidesAlias,
  generatedSlidesEntry,
  pluginCompileTimeSlides,
} from "../artifacts/generateCompiledSlides.ts";
import { pluginAddonsModule } from "../extensions/injectAddonsModule.ts";
import { loadClientRuntimeManifest } from "../runtime/runtimeManifest.ts";
import { pluginThemeModule } from "../extensions/injectThemeModule.ts";
import { pluginVirtualEntry } from "../runtime/virtualEntryPlugin.ts";
import { resolveSlidesSourceFile } from "./slidesSourceFile.ts";

const require = createRequire(import.meta.url);

function resolvePackageImport(specifier: string) {
  return require.resolve(specifier);
}

export function createSlidesViteConfig(options: {
  appRoot: string;
  slidesFile?: string;
}): UserConfig {
  const { appRoot, slidesFile } = options;
  const slidesSourceFile = resolveSlidesSourceFile(appRoot, slidesFile);
  const runtimeManifest = loadClientRuntimeManifest();

  return {
    root: appRoot,
    css: {
      postcss: {
        plugins: [tailwindcss()],
      },
    },
    plugins: [
      pluginVirtualEntry({
        appRoot,
        slidesSourceFile,
        clientEntryPath: runtimeManifest.runtimeEntry,
        clientStylePath: runtimeManifest.styleEntry,
      }),
      pluginCompileTimeSlides({
        appRoot,
        slidesSourceFile,
      }),
      pluginAddonsModule({
        appRoot,
        slidesSourceFile,
      }),
      pluginThemeModule({
        appRoot,
        slidesSourceFile,
      }),
      react(),
    ],
    resolve: {
      alias: {
        "@mdx-js/react": resolvePackageImport("@mdx-js/react"),
        "react/jsx-runtime": resolvePackageImport("react/jsx-runtime"),
        "react/jsx-dev-runtime": resolvePackageImport("react/jsx-dev-runtime"),
        react: resolvePackageImport("react"),
        "react-dom/client": resolvePackageImport("react-dom/client"),
        "react-dom": resolvePackageImport("react-dom"),
        [generatedSlidesAlias]: path.resolve(appRoot, generatedSlidesEntry),
      },
    },
  };
}
