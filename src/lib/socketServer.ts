import type { Server as SocketIOServer } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "../types/socketEvents";

declare global {
  // eslint-disable-next-line no-var
  var __io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | undefined;
}

export function setSocketIO(io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) {
  global.__io = io;
}

export function getSocketIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null {
  return global.__io || null;
}
