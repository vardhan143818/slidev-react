export function countPeers(peerLastSeen: Map<string, number>) {
  return peerLastSeen.size;
}

export function markPeerSeen(
  peerLastSeen: Map<string, number>,
  peerId: string,
  activityAt: number,
) {
  peerLastSeen.set(peerId, activityAt);
}

export function removePeer(peerLastSeen: Map<string, number>, peerId: string) {
  return peerLastSeen.delete(peerId);
}

export function sweepStalePeers(
  peerLastSeen: Map<string, number>,
  now: number,
  staleAfterMs: number,
) {
  for (const [peerId, lastSeenAt] of peerLastSeen) {
    if (now - lastSeenAt > staleAfterMs) peerLastSeen.delete(peerId);
  }
}

export function resolveRemoteActive(
  lastRemoteActivityAt: number,
  now: number,
  activeWindowMs: number,
) {
  return now - lastRemoteActivityAt <= activeWindowMs;
}
