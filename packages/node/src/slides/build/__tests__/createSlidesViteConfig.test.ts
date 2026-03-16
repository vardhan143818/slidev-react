import { describe, expect, it } from "vite-plus/test";
import { createSlidesViteConfig } from "../config/createSlidesViteConfig.ts";

describe("createSlidesViteConfig", () => {
  it("prebundles browser-heavy addon runtimes for dev startup", () => {
    const config = createSlidesViteConfig({
      appRoot: process.cwd(),
    });

    expect(config.optimizeDeps?.include).toEqual([
      "@antv/g2",
      "@antv/g2/esm/lib/plot",
      "@antv/g-svg",
      "mermaid/dist/mermaid.esm.min.mjs",
    ]);
  });

  it("aliases generated modules and self-contained runtime fallbacks", () => {
    const config = createSlidesViteConfig({
      appRoot: process.cwd(),
    });

    expect(config.resolve?.alias).not.toHaveProperty("@");
    expect(config.resolve?.alias).toHaveProperty("@generated/slides");
    expect(config.resolve?.alias).toHaveProperty("@mdx-js/react");
    expect(config.resolve?.alias).toHaveProperty("react");
    expect(config.resolve?.alias).toHaveProperty("react-dom");
    expect(config.resolve?.alias).toHaveProperty("react-dom/client");
    expect(config.resolve?.alias).toHaveProperty("react/jsx-runtime");
    expect(config.resolve?.alias).toHaveProperty("react/jsx-dev-runtime");
    expect(Object.keys(config.resolve?.alias ?? {})).toHaveLength(7);
  });
});
