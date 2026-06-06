// ─── Événements Socket.IO partagés (client ↔ serveur) ───

import type { Move, GameStatus, EndReason, GameResult, Color } from '@/lib/chess/types';

// ──────── Client → Serveur ────────

export interface RoomCreatePayload {
  timeControl: 'bullet' | 'blitz' | 'rapid' | 'unlimited';
  color: Color;
}

export interface RoomJoinPayload {
  roomId: string;
}

export interface MoveMakePayload {
  roomId: string;
  move: { from: string; to: string; promotion?: string };
  fen: string;
}

export interface GameActionPayload {
  roomId: string;
}

export interface ClientEvents {
  'room:create': (payload: RoomCreatePayload) => void;
  'room:join': (payload: RoomJoinPayload) => void;
  'move:make': (payload: MoveMakePayload) => void;
  'game:resign': (payload: GameActionPayload) => void;
  'game:draw-offer': (payload: GameActionPayload) => void;
  'game:draw-accept': (payload: GameActionPayload) => void;
  'game:draw-decline': (payload: GameActionPayload) => void;
}

// ──────── Serveur → Client ────────

export interface RoomCreatedPayload {
  roomId: string;
  shareUrl: string;
}

export interface RoomJoinedPayload {
  roomId: string;
  color: Color;
  opponent: {
    id: string;
    name: string;
    elo: number;
  };
}

export interface RoomWaitingPayload {
  roomId: string;
}

export interface MoveAppliedPayload {
  move: { from: string; to: string; promotion?: string; san: string };
  fen: string;
  status: GameStatus;
}

export interface MoveInvalidPayload {
  reason: string;
}

export interface GameEndedPayload {
  result: GameResult;
  reason: EndReason;
  pgn: string;
}

export interface DrawOfferedPayload {
  by: Color;
}

export interface PlayerDisconnectedPayload {
  color: Color;
  timeout: number;
}

export interface PlayerReconnectedPayload {
  color: Color;
}

export type GameListItem = {
  roomId: string;
  whiteName: string;
  blackName?: string;
  timeControl: string;
  spectators: number;
  createdAt: number;
};

export interface ServerEvents {
  'room:created': (payload: RoomCreatedPayload) => void;
  'room:joined': (payload: RoomJoinedPayload) => void;
  'room:waiting': (payload: RoomWaitingPayload) => void;
  'room:player-joined': (payload: { playerName: string }) => void;
  'move:applied': (payload: MoveAppliedPayload) => void;
  'move:invalid': (payload: MoveInvalidPayload) => void;
  'game:ended': (payload: GameEndedPayload) => void;
  'game:draw-offered': (payload: DrawOfferedPayload) => void;
  'game:draw-declined': () => void;
  'player:disconnected': (payload: PlayerDisconnectedPayload) => void;
  'player:reconnected': (payload: PlayerReconnectedPayload) => void;
  'room:state': (payload: { fen: string; turn: Color; moves: string[] }) => void;
  'room:list': (payload: { games: GameListItem[] }) => void;
}
