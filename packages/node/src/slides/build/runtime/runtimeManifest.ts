import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);

export interface ClientRuntimeAddonManifestEntry {
  id: string;
  module: string;
  style?: string;
}

export interface ClientRuntimeManifest {
  runtimeEntry: string;
  styleEntry: string;
  addons: ClientRuntimeAddonManifestEntry[];
}

let manifestCache: ClientRuntimeManifest | null = null;

function resolveClientRuntimeSpecifier(specifier: string) {
  return pathToFileURL(require.resolve(specifier)).href;
}

export function loadClientRuntimeManifest(): ClientRuntimeManifest {
  if (manifestCache) return manifestCache;

  try {
    const manifestPath = require.resolve("@slidev-react/client/manifest");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as ClientRuntimeManifest;
    manifestCache = {
      runtimeEntry: resolveClientRuntimeSpecifier(manifest.runtimeEntry),
      styleEntry: resolveClientRuntimeSpecifier(manifest.styleEntry),
      addons: manifest.addons.map((addon) => ({
        ...addon,
        module: resolveClientRuntimeSpecifier(addon.module),
        style: addon.style
          ? resolveClientRuntimeSpecifier(addon.style)
          : undefined,
      })),
    };
    return manifestCache;
  } catch {
    const clientPackageRoot = path.dirname(require.resolve("@slidev-react/client/package.json"));
    const manifestPath = path.join(clientPackageRoot, "manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as ClientRuntimeManifest;
    manifestCache = {
      runtimeEntry: resolveClientRuntimeSpecifier(manifest.runtimeEntry),
      styleEntry: resolveClientRuntimeSpecifier(manifest.styleEntry),
      addons: manifest.addons.map((addon) => ({
        ...addon,
        module: resolveClientRuntimeSpecifier(addon.module),
        style: addon.style
          ? resolveClientRuntimeSpecifier(addon.style)
          : undefined,
      })),
    };
    return manifestCache;
  }
}
