import type { PresentationTransportState } from "../model/status";

const MAX_RECONNECT_DELAY_MS = 5000;
const BASE_RECONNECT_DELAY_MS = 800;

export interface WebSocketTransport {
  send: (payload: string) => void;
  dispose: () => void;
}

export function createWebSocketTransport({
  sessionWsUrl,
  sessionId,
  senderId,
  onMessage,
  onStateChange,
  onOpen,
}: {
  sessionWsUrl: string;
  sessionId: string;
  senderId: string;
  onMessage: (incoming: unknown) => void;
  onStateChange: (state: PresentationTransportState) => void;
  onOpen?: () => void;
}): WebSocketTransport {
  let disposed = false;
  let reconnectAttempt = 0;
  let reconnectTimeoutId: number | null = null;
  let socket: WebSocket | null = null;
  let listeners: {
    open: () => void;
    message: (event: MessageEvent<unknown>) => void;
    error: () => void;
    close: () => void;
  } | null = null;

  const closeSocket = () => {
    if (!socket) return;

    if (listeners) {
      socket.removeEventListener("open", listeners.open);
      socket.removeEventListener("message", listeners.message);
      socket.removeEventListener("error", listeners.error);
      socket.removeEventListener("close", listeners.close);
    }

    socket.close();
    socket = null;
    listeners = null;
  };

  const scheduleReconnect = () => {
    if (disposed) return;

    onStateChange("reconnecting");
    const delay = Math.min(BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempt, MAX_RECONNECT_DELAY_MS);
    reconnectAttempt += 1;
    reconnectTimeoutId = window.setTimeout(() => {
      reconnectTimeoutId = null;
      connect();
    }, delay);
  };

  const connect = () => {
    if (disposed) return;

    closeSocket();
    onStateChange("connecting");

    const connectionUrl = new URL(sessionWsUrl);
    connectionUrl.searchParams.set("session", sessionId);
    connectionUrl.searchParams.set("sender", senderId);

    const nextSocket = new WebSocket(connectionUrl.toString());
    socket = nextSocket;

    const handleOpen = () => {
      reconnectAttempt = 0;
      onStateChange("connected");
      onOpen?.();
    };

    const handleMessage = (event: MessageEvent<unknown>) => {
      if (typeof event.data !== "string") return;

      try {
        onMessage(JSON.parse(event.data));
      } catch {
        // Ignore malformed websocket payloads.
      }
    };

    const handleError = () => {
      onStateChange("reconnecting");
    };

    const handleClose = () => {
      if (disposed) return;

      scheduleReconnect();
    };

    listeners = {
      open: handleOpen,
      message: handleMessage,
      error: handleError,
      close: handleClose,
    };

    nextSocket.addEventListener("open", handleOpen);
    nextSocket.addEventListener("message", handleMessage);
    nextSocket.addEventListener("error", handleError);
    nextSocket.addEventListener("close", handleClose);
  };

  connect();

  return {
    send: (payload) => {
      if (socket?.readyState === WebSocket.OPEN) socket.send(payload);
    },
    dispose: () => {
      disposed = true;
      if (reconnectTimeoutId !== null) window.clearTimeout(reconnectTimeoutId);
      closeSocket();
    },
  };
}
