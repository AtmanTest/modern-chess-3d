// ─── Client Socket.IO — connexion et helpers ───

import { io, Socket } from 'socket.io-client';
import type { ClientEvents, ServerEvents } from '@/server/socket/events';

let socket: Socket<ServerEvents, ClientEvents> | null = null;

export function getSocket(): Socket<ServerEvents, ClientEvents> {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
    socket = io(socketUrl || undefined, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket(): Socket<ServerEvents, ClientEvents> {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
