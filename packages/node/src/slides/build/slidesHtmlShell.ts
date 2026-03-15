import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

export function extractTitleFromSlidesFile(slidesSourceFile: string): string {
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

export function generateSlidesIndexHtml(options: {
  title: string;
  entryModuleId: string;
}) {
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
    <script type="module" src="/${options.entryModuleId}"></script>
  </body>
</html>`;
}
