export type PresentationTransportState = "disabled" | "connecting" | "connected" | "reconnecting";

export type PresentationSyncStatus = "disabled" | "connecting" | "connected" | "degraded";

export function resolvePresentationSyncStatus({
  sessionEnabled,
  syncMode,
  sessionWsUrl,
  transportState,
  broadcastConnected,
}: {
  sessionEnabled: boolean;
  syncMode: "send" | "receive" | "both" | "off";
  sessionWsUrl: string | null;
  transportState: PresentationTransportState;
  broadcastConnected: boolean;
}): PresentationSyncStatus {
  if (!sessionEnabled) return "disabled";

  if (syncMode === "off") return "disabled";

  if (sessionWsUrl) {
    if (transportState === "connected") return "connected";

    if (broadcastConnected) return "degraded";

    return "connecting";
  }

  if (broadcastConnected) return "connected";

  return "degraded";
}
