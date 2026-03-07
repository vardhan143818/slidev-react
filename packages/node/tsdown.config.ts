import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "slides/build/createSlidesViteConfig":
      "src/slides/build/createSlidesViteConfig.ts",
  },
  dts: true,
  deps: {
    neverBundle: [/^[^./]/],
  },
  format: "esm",
  outDir: "dist",
  platform: "node",
  unbundle: true,
});
