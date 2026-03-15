import { builtinAddonRuntimeEntries, type BuiltinAddonRuntimeEntry } from '../addons/builtin/runtimeEntries'

export interface ClientRuntimeManifest {
  runtimeEntry: string
  styleEntry: string
  addons: BuiltinAddonRuntimeEntry[]
}

export const clientRuntimeManifest: ClientRuntimeManifest = {
  runtimeEntry: '@slidev-react/client/runtime',
  styleEntry: '@slidev-react/client/style.css',
  addons: builtinAddonRuntimeEntries,
}
