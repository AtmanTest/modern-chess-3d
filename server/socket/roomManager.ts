// ─── Gestionnaire de rooms en mémoire ───

import { Chess } from 'chess.js';
import type { Color, GameStatus, EndReason, GameResult } from '@/lib/chess/types';

export interface Player {
  id: string;
  name: string;
  elo: number;
  socketId: string;
  connected: boolean;
}

export interface Room {
  id: string;
  game: Chess;
  players: { white?: Player; black?: Player };
  spectators: string[];
  timeControl: 'bullet' | 'blitz' | 'rapid' | 'unlimited';
  createdAt: number;
  lastActivity: number;
  result: GameResult;
  endReason: EndReason | null;
  drawOffer: { by?: Color } | null;
  status: 'waiting' | 'playing' | 'ended';
}

const rooms = new Map<string, Room>();
const ROOM_TTL_MS = 30 * 60 * 1000; // 30 min

// ── Nettoyage périodique des rooms expirées ──
setInterval(() => {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (now - room.lastActivity > ROOM_TTL_MS && room.status !== 'playing') {
      rooms.delete(id);
    }
  }
}, 60_000);

export function createRoom(
  roomId: string,
  timeControl: 'bullet' | 'blitz' | 'rapid' | 'unlimited',
): Room {
  const room: Room = {
    id: roomId,
    game: new Chess(),
    players: {},
    spectators: [],
    timeControl,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    result: null,
    endReason: null,
    drawOffer: null,
    status: 'waiting',
  };
  rooms.set(roomId, room);
  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function joinRoom(
  roomId: string,
  player: Omit<Player, 'connected'>,
): { room: Room; color: Color } | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  if (!room.players.white) {
    room.players.white = { ...player, connected: true };
    room.lastActivity = Date.now();
    return { room, color: 'w' };
  }

  if (!room.players.black && room.players.white.id !== player.id) {
    room.players.black = { ...player, connected: true };
    room.status = 'playing';
    room.lastActivity = Date.now();
    return { room, color: 'b' };
  }

  // Room full — add as spectator
  room.spectators.push(player.socketId);
  return null;
}

export function reconnectPlayer(
  roomId: string,
  playerId: string,
  socketId: string,
): boolean {
  const room = rooms.get(roomId);
  if (!room) return false;

  for (const color of ['white', 'black'] as const) {
    if (room.players[color]?.id === playerId) {
      room.players[color]!.socketId = socketId;
      room.players[color]!.connected = true;
      room.lastActivity = Date.now();
      return true;
    }
  }
  return false;
}

export function disconnectPlayer(
  roomId: string,
  socketId: string,
): Color | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  for (const color of ['white', 'black'] as const) {
    if (room.players[color]?.socketId === socketId) {
      room.players[color]!.connected = false;
      room.lastActivity = Date.now();
      return color === 'white' ? 'w' : 'b';
    }
  }
  return null;
}

export function removeRoom(roomId: string): void {
  rooms.delete(roomId);
}

export function getActiveGames(): Array<{
  roomId: string;
  whiteName: string;
  blackName?: string;
  timeControl: string;
  spectators: number;
  createdAt: number;
}> {
  const list: ReturnType<typeof getActiveGames> = [];
  for (const [roomId, room] of rooms) {
    if (room.status !== 'ended') {
      list.push({
        roomId,
        whiteName: room.players.white?.name ?? 'Waiting...',
        blackName: room.players.black?.name,
        timeControl: room.timeControl,
        spectators: room.spectators.length,
        createdAt: room.createdAt,
      });
    }
  }
  return list;
}

export function hasPlayer(roomId: string, playerId: string): boolean {
  const room = rooms.get(roomId);
  if (!room) return false;
  return (
    room.players.white?.id === playerId || room.players.black?.id === playerId
  );
}
