import {
  PRESENTATION_PROTOCOL_VERSION,
  type PresentationEnvelope,
  type PresentationRole,
  type PresentationSharedState,
  type PresentationSyncMode,
  type SyncedPresentationRole,
} from "../../types";

export type EnvelopeInput = Omit<
  PresentationEnvelope,
  "version" | "sessionId" | "senderId" | "seq" | "timestamp"
>;

export function createEnvelope({
  sessionId,
  senderId,
  seq,
  timestamp,
  message,
}: {
  sessionId: string;
  senderId: string;
  seq: number;
  timestamp: number;
  message: EnvelopeInput;
}): PresentationEnvelope {
  switch (message.type) {
    case "session/join":
    case "session/leave":
    case "heartbeat": {
      const { role } = message.payload as {
        role: SyncedPresentationRole;
      };

      return {
        version: PRESENTATION_PROTOCOL_VERSION,
        sessionId,
        senderId,
        seq,
        timestamp,
        type: message.type,
        payload: {
          role,
        },
      };
    }
    case "state/snapshot": {
      const { state } = message.payload as {
        state: PresentationSharedState;
      };

      return {
        version: PRESENTATION_PROTOCOL_VERSION,
        sessionId,
        senderId,
        seq,
        timestamp,
        type: "state/snapshot",
        payload: {
          state,
        },
      };
    }
    case "state/patch": {
      const { state } = message.payload as {
        state: Partial<PresentationSharedState>;
      };

      return {
        version: PRESENTATION_PROTOCOL_VERSION,
        sessionId,
        senderId,
        seq,
        timestamp,
        type: "state/patch",
        payload: {
          state,
        },
      };
    }
  }
}

export function canSend(syncMode: PresentationSyncMode) {
  return syncMode === "send" || syncMode === "both";
}

export function canReceive(syncMode: PresentationSyncMode) {
  return syncMode === "receive" || syncMode === "both";
}

export function canAuthorState(role: PresentationRole) {
  return role === "presenter";
}

export function isCursorEqual(
  left: PresentationSharedState["cursor"],
  right: PresentationSharedState["cursor"],
) {
  if (left === right) return true;

  if (!left || !right) return false;

  return left.x === right.x && left.y === right.y;
}

export function createSnapshotState(localState: PresentationSharedState): PresentationSharedState {
  return {
    ...localState,
    lastUpdate: Date.now(),
  };
}
