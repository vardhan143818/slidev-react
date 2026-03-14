import { readFileSync } from "node:fs";
import type { Plugin } from "vite";
import { parse as parseYaml } from "yaml";

const VIRTUAL_ENTRY_ID = "virtual:slidev-react/entry";
const RESOLVED_VIRTUAL_ENTRY = "\0" + VIRTUAL_ENTRY_ID;

function extractTitleFromSlidesFile(slidesSourceFile: string): string {
  try {
    const source = readFileSync(slidesSourceFile, "utf8");
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return "Slidev React";

    const data = parseYaml(match[1]);
    return typeof data?.title === "string" ? data.title : "Slidev React";
  } catch {
    return "Slidev React";
  }
}

function generateIndexHtml(options: { title: string }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap"
    />
    <title>${options.title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/${VIRTUAL_ENTRY_ID}"></script>
  </body>
</html>`;
}

function generateEntryModule(clientEntryPath: string) {
  return `import { createElement } from "react"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "${clientEntryPath}"
import "${clientEntryPath.replace(/\/index$/, "")}/theme/index.css"

createRoot(document.getElementById("root")).render(
  createElement(StrictMode, null, createElement(App)),
)
`;
}

/**
 * Pure virtual entry — no physical files needed.
 *
 * Sets `appType: "custom"` to disable Vite's built-in HTML handling
 * (which would 404 without a physical index.html). Then provides its own
 * SPA-aware middleware as a post-hook — static files and HMR are served
 * by Vite's other middleware, and any remaining navigation request falls
 * through to our virtual HTML.
 */
export function pluginVirtualEntry(options: {
  slidesSourceFile: string;
  clientEntryPath: string;
}): Plugin {
  const { slidesSourceFile, clientEntryPath } = options;
  const title = extractTitleFromSlidesFile(slidesSourceFile);

  return {
    name: "slidev-react:virtual-entry",
    enforce: "pre",

    config() {
      return {
        appType: "custom",
      };
    },

    configureServer(server) {
      // Post-hook (returning function): runs AFTER Vite's static-file and
      // transform middlewares, so JS/CSS/image requests are handled normally.
      // Any unhandled navigation request falls through to us.
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const accept = req.headers.accept ?? "";

          // Only serve HTML for navigation requests
          if (!accept.includes("text/html")) {
            next();
            return;
          }

          const url = req.url ?? "/";
          const html = generateIndexHtml({ title });
          const transformed = await server.transformIndexHtml(
            url,
            html,
            req.originalUrl,
          );
          res.setHeader("Content-Type", "text/html");
          res.statusCode = 200;
          res.end(transformed);
        });
      };
    },

    resolveId(id) {
      if (id === VIRTUAL_ENTRY_ID || id === `/${VIRTUAL_ENTRY_ID}`) {
        return RESOLVED_VIRTUAL_ENTRY;
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ENTRY) {
        return generateEntryModule(clientEntryPath);
      }
    },
  };
}
