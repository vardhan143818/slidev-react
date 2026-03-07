import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolveSlidesSourceFile } from "./src/slides/build/slidesSourceFile";
import {
  generatedSlidesAlias,
  generatedSlidesEntry,
  pluginCompileTimeSlides,
} from "./src/slides/build/generateCompiledSlides";

const appRoot = process.cwd();
const slidesSourceFile = resolveSlidesSourceFile(appRoot);

export default defineConfig({
  plugins: [
    pluginCompileTimeSlides({
      appRoot,
      slidesSourceFile,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(appRoot, "./src"),
      [generatedSlidesAlias]: path.resolve(appRoot, generatedSlidesEntry),
      react: path.resolve(appRoot, "./node_modules/react"),
      "react-dom": path.resolve(appRoot, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(appRoot, "./node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(appRoot, "./node_modules/react/jsx-dev-runtime.js"),
    },
  },
});
