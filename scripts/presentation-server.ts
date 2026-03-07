import { createServer } from "node:http";
import { WebSocketServer } from "ws";

type ClientData = {
  sessionId: string;
  senderId: string;
};

const rooms = new Map<string, Set<import("ws").WebSocket>>();
const clientData = new WeakMap<import("ws").WebSocket, ClientData>();

function sanitizeSessionId(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);

  return normalized || "default";
}

function roomFor(sessionId: string) {
  const existing = rooms.get(sessionId);
  if (existing) return existing;

  const created = new Set<import("ws").WebSocket>();
  rooms.set(sessionId, created);
  return created;
}

function removeFromRoom(ws: import("ws").WebSocket) {
  const data = clientData.get(ws);
  if (!data) return;

  const room = rooms.get(data.sessionId);
  if (!room) return;

  room.delete(ws);
  if (room.size === 0) rooms.delete(data.sessionId);
}

const port = Number(process.env.PRESENTATION_WS_PORT ?? 4860);
const hostname = process.env.PRESENTATION_WS_HOST ?? "0.0.0.0";

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? `${hostname}:${port}`}`);

  if (url.pathname === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end("ok");
    return;
  }

  if (url.pathname !== "/ws") {
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end("slide-react presentation relay ready");
    return;
  }

  res.writeHead(426, { "content-type": "text/plain; charset=utf-8" });
  res.end("websocket upgrade required");
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? `${hostname}:${port}`}`);

  if (url.pathname !== "/ws") {
    socket.destroy();
    return;
  }

  const data = {
    sessionId: sanitizeSessionId(url.searchParams.get("session") ?? "default"),
    senderId: url.searchParams.get("sender") ?? "anonymous",
  };

  wss.handleUpgrade(req, socket, head, (ws) => {
    clientData.set(ws, data);
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", (ws) => {
  const data = clientData.get(ws);
  if (!data) {
    ws.close();
    return;
  }

  roomFor(data.sessionId).add(ws);

  ws.on("message", (message, isBinary) => {
    const room = rooms.get(data.sessionId);
    if (!room) return;

    for (const peer of room) {
      if (peer === ws || peer.readyState !== ws.OPEN) continue;
      peer.send(message, { binary: isBinary });
    }
  });

  ws.on("close", () => {
    removeFromRoom(ws);
  });
});

server.listen(port, hostname, () => {
  console.log(`[slide-react] presentation relay listening on ws://${hostname}:${port}/ws`);
});
