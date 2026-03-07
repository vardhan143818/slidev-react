import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "bin/slidev-react": "bin/slidev-react.ts",
  },
  dts: false,
  deps: {
    neverBundle: [/^[^./]/],
  },
  format: "esm",
  outDir: "dist",
  platform: "node",
  unbundle: true,
});
