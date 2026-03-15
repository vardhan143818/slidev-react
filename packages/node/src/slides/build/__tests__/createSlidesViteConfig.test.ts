import { describe, expect, it } from "vite-plus/test";
import { createSlidesViteConfig } from "../createSlidesViteConfig.ts";

describe("createSlidesViteConfig", () => {
  it("keeps dependency optimization on the default Vite path", () => {
    const config = createSlidesViteConfig({
      appRoot: process.cwd(),
    });

    expect(config.optimizeDeps).toBeUndefined();
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
