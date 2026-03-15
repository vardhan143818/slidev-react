import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadClientRuntimeManifest, type ClientRuntimeAddonManifestEntry } from "../runtime/runtimeManifest.ts";

const require = createRequire(import.meta.url);
const LOCAL_DEFINITION_FILES = ["index.ts", "index.tsx", "index.js", "index.jsx"];
const LOCAL_STYLE_FILE = "style.css";
const THEME_PACKAGE_PREFIX = "theme-";
const ADDON_PACKAGE_PREFIX = "addon-";

export interface ResolvedThemeExtension {
  id: string;
  importPath: string;
  styleImportPath?: string;
  definitionFilePath?: string;
  source: "local" | "package";
}

export interface ResolvedAddonExtension {
  id: string;
  importPath: string;
  styleImportPath?: string;
  definitionFilePath?: string;
  source: "builtin" | "local" | "package";
}

function findDefinitionFile(rootDir: string) {
  for (const fileName of LOCAL_DEFINITION_FILES) {
    const filePath = path.join(rootDir, fileName);
    if (existsSync(filePath)) return filePath;
  }

  return null;
}

function resolvePackageStyleEntry(packageName: string) {
  try {
    require.resolve(`${packageName}/style.css`);
    return `${packageName}/style.css`;
  } catch {
    return undefined;
  }
}

function resolveThemePackage(id: string) {
  const candidates = [`@slidev-react/theme-${id}`, `slidev-react-theme-${id}`];

  for (const packageName of candidates) {
    try {
      require.resolve(packageName);
      return {
        id,
        importPath: packageName,
        styleImportPath: resolvePackageStyleEntry(packageName),
        source: "package" as const,
      };
    } catch {
      // Try the next package candidate.
    }
  }

  return null;
}

function resolveAddonPackage(id: string) {
  const candidates = [`@slidev-react/addon-${id}`, `slidev-react-addon-${id}`];

  for (const packageName of candidates) {
    try {
      require.resolve(packageName);
      return {
        id,
        importPath: packageName,
        styleImportPath: resolvePackageStyleEntry(packageName),
        source: "package" as const,
      };
    } catch {
      // Try the next package candidate.
    }
  }

  return null;
}

function resolveLocalTheme(appRoot: string, id: string): ResolvedThemeExtension | null {
  const rootDir = path.join(appRoot, "packages", `${THEME_PACKAGE_PREFIX}${id}`);
  const definitionFilePath = findDefinitionFile(rootDir);
  if (!definitionFilePath) return null;

  const styleFilePath = path.join(rootDir, LOCAL_STYLE_FILE);

  return {
    id,
    importPath: pathToFileURL(definitionFilePath).href,
    styleImportPath: existsSync(styleFilePath) ? pathToFileURL(styleFilePath).href : undefined,
    definitionFilePath,
    source: "local",
  };
}

function resolveLocalAddon(appRoot: string, id: string): ResolvedAddonExtension | null {
  const rootDir = path.join(appRoot, "packages", `${ADDON_PACKAGE_PREFIX}${id}`);
  const definitionFilePath = findDefinitionFile(rootDir);
  if (!definitionFilePath) return null;

  const styleFilePath = path.join(rootDir, LOCAL_STYLE_FILE);

  return {
    id,
    importPath: pathToFileURL(definitionFilePath).href,
    styleImportPath: existsSync(styleFilePath) ? pathToFileURL(styleFilePath).href : undefined,
    definitionFilePath,
    source: "local",
  };
}

function resolveBuiltinAddon(id: string): ResolvedAddonExtension | null {
  const addon = loadClientRuntimeManifest().addons.find((entry) => entry.id === id);
  if (!addon) return null;

  return {
    id: addon.id,
    importPath: addon.module,
    styleImportPath: addon.style,
    source: "builtin",
  };
}

export function resolveThemeExtension(appRoot: string, id: string) {
  return resolveLocalTheme(appRoot, id) ?? resolveThemePackage(id);
}

export function resolveAddonExtension(appRoot: string, id: string) {
  return resolveBuiltinAddon(id) ?? resolveLocalAddon(appRoot, id) ?? resolveAddonPackage(id);
}

export function listBuiltinAddonIds() {
  return loadClientRuntimeManifest().addons.map((addon) => addon.id);
}

export function listBuiltinAddons() {
  return loadClientRuntimeManifest().addons.slice() as ClientRuntimeAddonManifestEntry[];
}
