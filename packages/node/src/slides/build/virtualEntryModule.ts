export function generateVirtualEntryModule(options: {
  clientEntryPath: string;
  clientStylePath: string;
}) {
  const { clientEntryPath, clientStylePath } = options;

  return `import { mountSlidesApp } from "${clientEntryPath}"
import "${clientStylePath}"

mountSlidesApp(document.getElementById("root"))
`;
}
