import type { MutableRefObject } from 'react'
import type { PresentationSession } from '../session'
import type { PresentationSharedState } from '../types'
import type { EnvelopeInput } from './model/replication'
import type { PresentationSyncStatus } from './model/status'

export type {
  PresentationSyncStatus,
  PresentationTransportState,
} from './model/status'

export interface UsePresentationSyncOptions {
  session: PresentationSession
  currentIndex: number
  total: number
  goTo: (index: number) => void
  followRemotePage: boolean
  localState: PresentationSharedState
  onRemoteState: (
    patch: Partial<PresentationSharedState>,
    remotePage: number,
  ) => void
}

export interface UsePresentationSyncResult {
  status: PresentationSyncStatus
  broadcastConnected: boolean
  wsConnected: boolean
  lastSyncedAt: number | null
  peerCount: number
  remoteActive: boolean
}

export type PresentationSyncSendEnvelope = (message: EnvelopeInput) => void

export interface PresentationSyncRuntimeRefs {
  seqRef: MutableRefObject<number>
  currentIndexRef: MutableRefObject<number>
  goToRef: MutableRefObject<(index: number) => void>
  totalRef: MutableRefObject<number>
  followRemotePageRef: MutableRefObject<boolean>
  localStateRef: MutableRefObject<PresentationSharedState>
  onRemoteStateRef: MutableRefObject<
    (patch: Partial<PresentationSharedState>, remotePage: number) => void
  >
  lastRemoteUpdateRef: MutableRefObject<number>
  remotePageRef: MutableRefObject<number>
  sendEnvelopeRef: MutableRefObject<PresentationSyncSendEnvelope | null>
  sendSnapshotRef: MutableRefObject<(() => void) | null>
  lastSentStateRef: MutableRefObject<PresentationSharedState | null>
  pendingCursorRef: MutableRefObject<PresentationSharedState['cursor'] | null>
  cursorFlushTimerRef: MutableRefObject<number | null>
}
