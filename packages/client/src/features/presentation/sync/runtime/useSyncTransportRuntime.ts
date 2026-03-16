import { useEffect, useState } from 'react'
import type { PresentationSession } from '../../session'
import {
  parsePresentationEnvelope,
  type PresentationSharedState,
  type SyncedPresentationRole,
} from '../../types'
import { createBroadcastChannelTransport } from '../adapters/broadcastChannelTransport'
import { createWebSocketTransport } from '../adapters/websocketTransport'
import {
  canAuthorState,
  canReceive,
  canSend,
  createEnvelope,
  createSnapshotState,
  type EnvelopeInput,
} from '../model/replication'
import type { PresentationTransportState } from '../model/status'
import type { PresentationSyncRuntimeRefs } from '../types'
const BROADCAST_CHANNEL_PREFIX = 'slide-react:presentation:session:'
const HEARTBEAT_INTERVAL_MS = 5000
const PEER_STALE_AFTER_MS = HEARTBEAT_INTERVAL_MS * 3
const PEER_SWEEP_INTERVAL_MS = 2000
const REMOTE_ACTIVE_WINDOW_MS = HEARTBEAT_INTERVAL_MS * 2

export interface SyncTransportRuntime {
  broadcastConnected: boolean
  wsState: PresentationTransportState
}

export function useSyncTransportRuntime({
  session,
  refs,
  markPeerActivity,
  removePeerActivity,
  sweepPresence,
  resetPresence,
  applyIncomingState,
}: {
  session: PresentationSession
  refs: PresentationSyncRuntimeRefs
  markPeerActivity: (peerId: string, activityAt: number) => void
  removePeerActivity: (peerId: string) => void
  sweepPresence: (options: {
    now: number
    staleAfterMs: number
    activeWindowMs: number
  }) => void
  resetPresence: () => void
  applyIncomingState: (options: {
    patchState: Partial<PresentationSharedState>
    timestamp: number
  }) => void
}): SyncTransportRuntime {
  const [broadcastConnected, setBroadcastConnected] = useState(false)
  const [wsState, setWsState] = useState<PresentationTransportState>('disabled')

  useEffect(() => {
    if (
      !session.enabled ||
      !session.sessionId ||
      (session.role !== 'presenter' && session.role !== 'viewer')
    ) {
      return
    }

    if (!canSend(session.syncMode) && !canReceive(session.syncMode)) return

    const sessionId = session.sessionId
    const senderId = session.senderId
    const syncMode = session.syncMode
    const syncRole = session.role as SyncedPresentationRole
    const sessionWsUrl = session.wsUrl
    const channelName = `${BROADCAST_CHANNEL_PREFIX}${sessionId}`
    let disposed = false
    let heartbeatIntervalId: number | null = null
    let peerSweepIntervalId: number | null = null
    let websocketTransport: ReturnType<typeof createWebSocketTransport> | null =
      null

    const sendEnvelope = (message: EnvelopeInput) => {
      if (disposed) return

      refs.seqRef.current += 1
      const envelope = createEnvelope({
        sessionId,
        senderId,
        seq: refs.seqRef.current,
        timestamp: Date.now(),
        message,
      })

      broadcastTransport?.send(envelope)
      websocketTransport?.send(JSON.stringify(envelope))
    }

    const sendSnapshot = () => {
      if (!canSend(syncMode) || !canAuthorState(session.role)) return

      const state = createSnapshotState(refs.localStateRef.current)
      sendEnvelope({
        type: 'state/snapshot',
        payload: {
          state,
        },
      })
    }

    const onIncomingEnvelope = (incoming: unknown) => {
      const envelope = parsePresentationEnvelope(incoming)
      if (!envelope) return

      if (envelope.sessionId !== sessionId || envelope.senderId === senderId) {
        return
      }

      const observedAt = Date.now()
      markPeerActivity(envelope.senderId, observedAt)

      if (envelope.type === 'session/leave') {
        removePeerActivity(envelope.senderId)
        return
      }

      if (envelope.type === 'heartbeat') return

      if (
        envelope.type === 'session/join' &&
        canSend(syncMode) &&
        canAuthorState(syncRole)
      ) {
        sendSnapshot()
        return
      }

      if (
        (envelope.type === 'state/snapshot' ||
          envelope.type === 'state/patch') &&
        canReceive(syncMode)
      ) {
        applyIncomingState({
          patchState: envelope.payload.state,
          timestamp: envelope.timestamp,
        })
      }
    }

    const broadcastTransport = createBroadcastChannelTransport({
      channelName,
      onMessage: onIncomingEnvelope,
      onConnectedChange: setBroadcastConnected,
    })

    if (sessionWsUrl) {
      websocketTransport = createWebSocketTransport({
        sessionWsUrl,
        sessionId,
        senderId,
        onMessage: onIncomingEnvelope,
        onStateChange: setWsState,
        onOpen: () => {
          sendEnvelope({
            type: 'session/join',
            payload: {
              role: syncRole,
            },
          })

          if (canAuthorState(syncRole)) sendSnapshot()
        },
      })
    } else {
      setWsState('disabled')
    }

    sendEnvelope({
      type: 'session/join',
      payload: {
        role: syncRole,
      },
    })

    if (canAuthorState(syncRole)) sendSnapshot()

    heartbeatIntervalId = window.setInterval(() => {
      sendEnvelope({
        type: 'heartbeat',
        payload: {
          role: syncRole,
        },
      })
    }, HEARTBEAT_INTERVAL_MS)

    peerSweepIntervalId = window.setInterval(() => {
      sweepPresence({
        now: Date.now(),
        staleAfterMs: PEER_STALE_AFTER_MS,
        activeWindowMs: REMOTE_ACTIVE_WINDOW_MS,
      })
    }, PEER_SWEEP_INTERVAL_MS)

    refs.sendEnvelopeRef.current = sendEnvelope
    refs.sendSnapshotRef.current = sendSnapshot

    return () => {
      sendEnvelope({
        type: 'session/leave',
        payload: {
          role: syncRole,
        },
      })
      disposed = true

      if (heartbeatIntervalId !== null) {
        window.clearInterval(heartbeatIntervalId)
      }

      if (peerSweepIntervalId !== null) {
        window.clearInterval(peerSweepIntervalId)
      }

      broadcastTransport?.dispose()
      websocketTransport?.dispose()
      refs.sendEnvelopeRef.current = null
      refs.sendSnapshotRef.current = null
      setWsState(sessionWsUrl ? 'connecting' : 'disabled')
      resetPresence()
    }
  }, [
    applyIncomingState,
    markPeerActivity,
    removePeerActivity,
    refs.localStateRef,
    refs.sendEnvelopeRef,
    refs.sendSnapshotRef,
    refs.seqRef,
    resetPresence,
    session.enabled,
    session.role,
    session.senderId,
    session.sessionId,
    session.syncMode,
    session.wsUrl,
    sweepPresence,
  ])

  return {
    broadcastConnected,
    wsState,
  }
}
