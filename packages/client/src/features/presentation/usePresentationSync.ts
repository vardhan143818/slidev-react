import { useEffect, useMemo, useRef, useState } from "react";
import type { PresentationSession } from "./session";
import {
  parsePresentationEnvelope,
  type PresentationSharedState,
  type SyncedPresentationRole,
} from "./types";
import {
  canAuthorState,
  canReceive,
  canSend,
  createEnvelope,
  createSnapshotState,
  isCursorEqual,
  type EnvelopeInput,
} from "./sync/model/replication";
import {
  countPeers,
  markPeerSeen,
  removePeer,
  resolveRemoteActive,
  sweepStalePeers,
} from "./sync/model/presence";
import {
  resolvePresentationSyncStatus,
  type PresentationSyncStatus,
  type PresentationTransportState,
} from "./sync/model/status";
import { createBroadcastChannelTransport } from "./sync/adapters/broadcastChannelTransport";
import { createWebSocketTransport } from "./sync/adapters/websocketTransport";

const BROADCAST_CHANNEL_PREFIX = "slide-react:presentation:session:";
const HEARTBEAT_INTERVAL_MS = 5000;
const CURSOR_PATCH_INTERVAL_MS = 80;
const PEER_STALE_AFTER_MS = HEARTBEAT_INTERVAL_MS * 3;
const PEER_SWEEP_INTERVAL_MS = 2000;
const REMOTE_ACTIVE_WINDOW_MS = HEARTBEAT_INTERVAL_MS * 2;
export type { PresentationSyncStatus } from "./sync/model/status";

export interface UsePresentationSyncResult {
  status: PresentationSyncStatus;
  broadcastConnected: boolean;
  wsConnected: boolean;
  lastSyncedAt: number | null;
  peerCount: number;
  remoteActive: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function usePresentationSync({
  session,
  currentIndex,
  total,
  goTo,
  followRemotePage,
  localState,
  onRemoteState,
}: {
  session: PresentationSession;
  currentIndex: number;
  total: number;
  goTo: (index: number) => void;
  followRemotePage: boolean;
  localState: PresentationSharedState;
  onRemoteState: (patch: Partial<PresentationSharedState>, remotePage: number) => void;
}): UsePresentationSyncResult {
  const [broadcastConnected, setBroadcastConnected] = useState(false);
  const [wsState, setWsState] = useState<PresentationTransportState>("disabled");
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [peerCount, setPeerCount] = useState(0);
  const [remoteActive, setRemoteActive] = useState(false);

  const seqRef = useRef(0);
  const currentIndexRef = useRef(currentIndex);
  const goToRef = useRef(goTo);
  const totalRef = useRef(total);
  const followRemotePageRef = useRef(followRemotePage);
  const localStateRef = useRef(localState);
  const onRemoteStateRef = useRef(onRemoteState);
  const lastRemoteUpdateRef = useRef(0);
  const remotePageRef = useRef(currentIndex);
  const sendEnvelopeRef = useRef<((message: EnvelopeInput) => void) | null>(null);
  const sendSnapshotRef = useRef<(() => void) | null>(null);
  const lastSentStateRef = useRef<PresentationSharedState | null>(null);
  const pendingCursorRef = useRef<PresentationSharedState["cursor"] | null>(null);
  const cursorFlushTimerRef = useRef<number | null>(null);
  const peerLastSeenRef = useRef<Map<string, number>>(new Map());
  const lastRemoteActivityRef = useRef(0);

  currentIndexRef.current = currentIndex;
  goToRef.current = goTo;
  totalRef.current = total;
  followRemotePageRef.current = followRemotePage;
  localStateRef.current = localState;
  onRemoteStateRef.current = onRemoteState;

  useEffect(() => {
    lastSentStateRef.current = null;
    pendingCursorRef.current = null;
    peerLastSeenRef.current.clear();
    lastRemoteActivityRef.current = 0;
    remotePageRef.current = currentIndexRef.current;
    setPeerCount(0);
    setRemoteActive(!canReceive(session.syncMode));
    if (cursorFlushTimerRef.current !== null) {
      window.clearTimeout(cursorFlushTimerRef.current);
      cursorFlushTimerRef.current = null;
    }
  }, [session.enabled, session.role, session.sessionId, session.syncMode]);

  useEffect(() => {
    if (
      !session.enabled ||
      !session.sessionId ||
      (session.role !== "presenter" && session.role !== "viewer")
    )
      return;

    if (!canSend(session.syncMode) && !canReceive(session.syncMode)) return;

    const sessionId = session.sessionId;
    const senderId = session.senderId;
    const syncMode = session.syncMode;
    const syncRole = session.role as SyncedPresentationRole;
    const sessionWsUrl = session.wsUrl;
    const channelName = `${BROADCAST_CHANNEL_PREFIX}${sessionId}`;
    let disposed = false;
    let heartbeatIntervalId: number | null = null;
    let peerSweepIntervalId: number | null = null;

    const refreshPeerCount = () => {
      const size = countPeers(peerLastSeenRef.current);
      setPeerCount((previous) => (previous === size ? previous : size));
    };

    const markPeerActivity = (peerId: string, activityAt: number) => {
      markPeerSeen(peerLastSeenRef.current, peerId, activityAt);
      refreshPeerCount();
    };

    const removePeerActivity = (peerId: string) => {
      if (!removePeer(peerLastSeenRef.current, peerId)) return;

      refreshPeerCount();
    };

    let websocketTransport: ReturnType<typeof createWebSocketTransport> | null = null;
    const broadcastTransport = createBroadcastChannelTransport({
      channelName,
      onMessage: (incoming) => {
        onIncomingEnvelope(incoming);
      },
      onConnectedChange: setBroadcastConnected,
    });

    const sendEnvelope = (message: EnvelopeInput) => {
      if (disposed) return;

      seqRef.current += 1;
      const envelope = createEnvelope({
        sessionId,
        senderId,
        seq: seqRef.current,
        timestamp: Date.now(),
        message,
      });

      broadcastTransport?.send(envelope);
      websocketTransport?.send(JSON.stringify(envelope));
    };

    const sendSnapshot = () => {
      if (!canSend(syncMode) || !canAuthorState(session.role)) return;

      const state = createSnapshotState(localStateRef.current);
      sendEnvelope({
        type: "state/snapshot",
        payload: {
          state,
        },
      });
    };

    const onIncomingEnvelope = (incoming: unknown) => {
      const envelope = parsePresentationEnvelope(incoming);
      if (!envelope) return;

      if (envelope.sessionId !== sessionId || envelope.senderId === senderId) return;

      const observedAt = Date.now();
      markPeerActivity(envelope.senderId, observedAt);
      lastRemoteActivityRef.current = observedAt;
      if (canReceive(syncMode)) setRemoteActive(true);

      if (envelope.type === "session/leave") {
        removePeerActivity(envelope.senderId);
        return;
      }

      if (envelope.type === "heartbeat") return;

      if (envelope.type === "session/join" && canSend(syncMode) && canAuthorState(syncRole)) {
        sendSnapshot();
        return;
      }

      if (envelope.type === "state/snapshot" || envelope.type === "state/patch") {
        if (!canReceive(syncMode)) return;

        const patchState = envelope.payload.state;
        const updateAt = patchState.lastUpdate ?? envelope.timestamp;
        if (updateAt <= lastRemoteUpdateRef.current) return;

        lastRemoteUpdateRef.current = updateAt;
        setLastSyncedAt(updateAt);

        let remotePage = remotePageRef.current;
        if (typeof patchState.page === "number") {
          const maxIndex = Math.max(totalRef.current - 1, 0);
          const nextIndex = clamp(Math.round(patchState.page), 0, maxIndex);
          remotePage = nextIndex;
          remotePageRef.current = nextIndex;
          if (followRemotePageRef.current && nextIndex !== currentIndexRef.current)
            goToRef.current(nextIndex);
        }

        onRemoteStateRef.current(patchState, remotePage);
      }
    };

    if (sessionWsUrl) {
      websocketTransport = createWebSocketTransport({
        sessionWsUrl,
        sessionId,
        senderId,
        onMessage: onIncomingEnvelope,
        onStateChange: setWsState,
        onOpen: () => {
          sendEnvelope({
            type: "session/join",
            payload: {
              role: syncRole,
            },
          });

          if (canAuthorState(syncRole)) sendSnapshot();
        },
      });
    } else setWsState("disabled");

    sendEnvelope({
      type: "session/join",
      payload: {
        role: syncRole,
      },
    });

    if (canAuthorState(syncRole)) sendSnapshot();

    heartbeatIntervalId = window.setInterval(() => {
      sendEnvelope({
        type: "heartbeat",
        payload: {
          role: syncRole,
        },
      });
    }, HEARTBEAT_INTERVAL_MS);

    peerSweepIntervalId = window.setInterval(() => {
      const now = Date.now();
      sweepStalePeers(peerLastSeenRef.current, now, PEER_STALE_AFTER_MS);
      refreshPeerCount();
      if (canReceive(syncMode))
        setRemoteActive(
          resolveRemoteActive(lastRemoteActivityRef.current, now, REMOTE_ACTIVE_WINDOW_MS),
        );
    }, PEER_SWEEP_INTERVAL_MS);

    sendEnvelopeRef.current = sendEnvelope;
    sendSnapshotRef.current = sendSnapshot;

    return () => {
      sendEnvelope({
        type: "session/leave",
        payload: {
          role: syncRole,
        },
      });
      disposed = true;

      if (heartbeatIntervalId !== null) window.clearInterval(heartbeatIntervalId);

      if (peerSweepIntervalId !== null) window.clearInterval(peerSweepIntervalId);

      broadcastTransport?.dispose();
      websocketTransport?.dispose();
      sendEnvelopeRef.current = null;
      sendSnapshotRef.current = null;
      setWsState(sessionWsUrl ? "connecting" : "disabled");
      setPeerCount(0);
      setRemoteActive(!canReceive(syncMode));
    };
  }, [
    session.enabled,
    session.role,
    session.senderId,
    session.sessionId,
    session.syncMode,
    session.wsUrl,
  ]);

  useEffect(() => {
    if (!session.enabled || !session.sessionId) return;

    if (!canSend(session.syncMode) || !canAuthorState(session.role)) return;

    const sendEnvelope = sendEnvelopeRef.current;
    if (!sendEnvelope) return;

    const previous = lastSentStateRef.current;
    const current = localState;

    if (!previous) {
      sendSnapshotRef.current?.();
      lastSentStateRef.current = current;
      return;
    }

    const hasPageChange = previous.page !== current.page;
    const hasClicksChange = previous.clicks !== current.clicks;
    const hasClicksTotalChange = previous.clicksTotal !== current.clicksTotal;
    const hasTimerChange = previous.timer !== current.timer;
    const hasDrawingsChange = previous.drawingsRevision !== current.drawingsRevision;
    const hasCursorChange = !isCursorEqual(previous.cursor, current.cursor);

    if (
      !hasPageChange &&
      !hasClicksChange &&
      !hasClicksTotalChange &&
      !hasTimerChange &&
      !hasDrawingsChange &&
      !hasCursorChange
    )
      return;

    if (
      hasPageChange ||
      hasClicksChange ||
      hasClicksTotalChange ||
      hasTimerChange ||
      hasDrawingsChange
    ) {
      sendEnvelope({
        type: "state/patch",
        payload: {
          state: {
            ...(hasPageChange ? { page: current.page } : {}),
            ...(hasClicksChange ? { clicks: current.clicks } : {}),
            ...(hasClicksTotalChange ? { clicksTotal: current.clicksTotal } : {}),
            ...(hasTimerChange ? { timer: current.timer } : {}),
            ...(hasDrawingsChange
              ? {
                  drawings: current.drawings,
                  drawingsRevision: current.drawingsRevision,
                }
              : {}),
            lastUpdate: Date.now(),
          },
        },
      });
    }

    if (hasCursorChange) {
      pendingCursorRef.current = current.cursor;
      if (cursorFlushTimerRef.current === null) {
        cursorFlushTimerRef.current = window.setTimeout(() => {
          cursorFlushTimerRef.current = null;
          sendEnvelope({
            type: "state/patch",
            payload: {
              state: {
                cursor: pendingCursorRef.current,
                lastUpdate: Date.now(),
              },
            },
          });
        }, CURSOR_PATCH_INTERVAL_MS);
      }
    }

    lastSentStateRef.current = current;
  }, [localState, session.enabled, session.role, session.sessionId, session.syncMode]);

  useEffect(() => {
    return () => {
      if (cursorFlushTimerRef.current !== null) window.clearTimeout(cursorFlushTimerRef.current);
    };
  }, []);

  const status = useMemo(
    () =>
      resolvePresentationSyncStatus({
        sessionEnabled: session.enabled,
        syncMode: session.syncMode,
        sessionWsUrl: session.wsUrl,
        transportState: wsState,
        broadcastConnected,
      }),
    [broadcastConnected, session.enabled, session.syncMode, session.wsUrl, wsState],
  );

  return {
    status,
    broadcastConnected,
    wsConnected: wsState === "connected",
    lastSyncedAt,
    peerCount,
    remoteActive,
  };
}
