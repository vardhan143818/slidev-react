import type { PresentationEnvelope } from "../../types";

export interface BroadcastChannelTransport {
  send: (envelope: PresentationEnvelope) => void;
  dispose: () => void;
}

export function createBroadcastChannelTransport({
  channelName,
  onMessage,
  onConnectedChange,
}: {
  channelName: string;
  onMessage: (incoming: unknown) => void;
  onConnectedChange?: (connected: boolean) => void;
}): BroadcastChannelTransport | null {
  if (typeof BroadcastChannel === "undefined") {
    onConnectedChange?.(false);
    return null;
  }

  const channel = new BroadcastChannel(channelName);
  const handleMessage = (event: MessageEvent<unknown>) => {
    onMessage(event.data);
  };

  channel.addEventListener("message", handleMessage);
  onConnectedChange?.(true);

  return {
    send: (envelope) => {
      channel.postMessage(envelope);
    },
    dispose: () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
      onConnectedChange?.(false);
    },
  };
}
