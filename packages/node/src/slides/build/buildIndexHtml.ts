import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

export function prepareBuildIndexHtml(options: {
  appRoot: string;
  html: string;
}) {
  const filePath = path.join(options.appRoot, "index.html");
  const backupDir = path.join(options.appRoot, ".slidev-react");
  const backupFilePath = path.join(backupDir, "index.original.html");
  const legacyBuildIndexPath = path.join(backupDir, "index.html");
  const existingHtml = existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
  const hasRestorableOriginal = existingHtml !== null && existingHtml !== options.html;

  if (hasRestorableOriginal) {
    mkdirSync(backupDir, { recursive: true });
    copyFileSync(filePath, backupFilePath);
  }

  writeFileSync(filePath, options.html, "utf8");

  return {
    filePath,
    cleanup() {
      if (hasRestorableOriginal && existsSync(backupFilePath)) {
        copyFileSync(backupFilePath, filePath);
        rmSync(backupFilePath, { force: true });
      } else {
        rmSync(filePath, { force: true });
      }

      rmSync(legacyBuildIndexPath, { force: true });
    },
  };
}
