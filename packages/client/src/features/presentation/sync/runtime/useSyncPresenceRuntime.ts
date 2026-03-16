import { useCallback, useEffect, useRef, useState } from 'react'
import type { PresentationSession } from '../../session'
import { canReceive } from '../model/replication'
import {
  countPeers,
  markPeerSeen,
  removePeer,
  resolveRemoteActive,
  sweepStalePeers,
} from '../model/presence'

export interface SyncPresenceRuntime {
  peerCount: number
  remoteActive: boolean
  markPeerActivity: (peerId: string, activityAt: number) => void
  removePeerActivity: (peerId: string) => void
  sweepPresence: (options: {
    now: number
    staleAfterMs: number
    activeWindowMs: number
  }) => void
  resetPresence: () => void
}

export function useSyncPresenceRuntime({
  session,
}: {
  session: PresentationSession
}): SyncPresenceRuntime {
  const [peerCount, setPeerCount] = useState(0)
  const [remoteActive, setRemoteActive] = useState(!canReceive(session.syncMode))
  const peerLastSeenRef = useRef<Map<string, number>>(new Map())
  const lastRemoteActivityRef = useRef(0)

  const resetPresence = useCallback(() => {
    peerLastSeenRef.current.clear()
    lastRemoteActivityRef.current = 0
    setPeerCount(0)
    setRemoteActive(!canReceive(session.syncMode))
  }, [session.syncMode])

  const refreshPeerCount = useCallback(() => {
    const nextPeerCount = countPeers(peerLastSeenRef.current)
    setPeerCount((previous) =>
      previous === nextPeerCount ? previous : nextPeerCount,
    )
  }, [])

  const markPeerActivity = useCallback(
    (peerId: string, activityAt: number) => {
      markPeerSeen(peerLastSeenRef.current, peerId, activityAt)
      lastRemoteActivityRef.current = activityAt
      refreshPeerCount()
      if (canReceive(session.syncMode)) setRemoteActive(true)
    },
    [refreshPeerCount, session.syncMode],
  )

  const removePeerActivity = useCallback(
    (peerId: string) => {
      if (!removePeer(peerLastSeenRef.current, peerId)) return

      refreshPeerCount()
    },
    [refreshPeerCount],
  )

  const sweepPresence = useCallback(
    ({
      now,
      staleAfterMs,
      activeWindowMs,
    }: {
      now: number
      staleAfterMs: number
      activeWindowMs: number
    }) => {
      sweepStalePeers(peerLastSeenRef.current, now, staleAfterMs)
      refreshPeerCount()

      if (canReceive(session.syncMode)) {
        setRemoteActive(
          resolveRemoteActive(
            lastRemoteActivityRef.current,
            now,
            activeWindowMs,
          ),
        )
      }
    },
    [refreshPeerCount, session.syncMode],
  )

  useEffect(() => {
    resetPresence()
  }, [resetPresence, session.enabled, session.role, session.sessionId])

  return {
    peerCount,
    remoteActive,
    markPeerActivity,
    removePeerActivity,
    sweepPresence,
    resetPresence,
  }
}
