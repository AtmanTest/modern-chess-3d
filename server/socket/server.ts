// ─── Serveur Next.js + Socket.IO custom ───

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { Socket } from 'socket.io';
import { nanoid } from 'nanoid';

import nextApp from './nextApp';
import {
  createRoom,
  getRoom,
  joinRoom,
  reconnectPlayer,
  disconnectPlayer,
  removeRoom,
  getActiveGames,
  hasPlayer,
} from './roomManager';
import { validateMove } from './gameValidator';
import type { ClientEvents, ServerEvents } from './events';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function main() {
  // Prepare Next.js
  await nextApp.prepare();
  const requestHandler = nextApp.getRequestHandler();

  // HTTP server
  const server = http.createServer((req, res) => {
    // CORS headers for Socket.IO handshake
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    requestHandler(req, res);
  });

  // Socket.IO
  const io = new SocketIOServer<ClientEvents, ServerEvents>(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingInterval: 25_000,
    pingTimeout: 20_000,
  });

  // ── Gestion des connexions ──

  const disconnectTimers = new Map<string, NodeJS.Timeout>();

  io.on('connection', (socket: Socket<ClientEvents, ServerEvents>) => {
    console.log(`[connect] ${socket.id}`);

    // ── Room: Create ──
    socket.on('room:create', (payload) => {
      const roomId = nanoid(8);
      const room = createRoom(roomId, payload.timeControl);

      // Assign creator to white
      const player = {
        id: socket.id,
        name: payload.color === 'w' ? 'Player 1' : 'Player 2',
        elo: 1200,
        socketId: socket.id,
      };

      const joinResult = joinRoom(roomId, player);
      if (!joinResult) return;

      socket.join(roomId);

      socket.emit('room:created', {
        roomId,
        shareUrl: `/play/${roomId}`,
      });
      socket.emit('room:waiting', { roomId });
    });

    // ── Room: Join ──
    socket.on('room:join', (payload) => {
      const room = getRoom(payload.roomId);
      if (!room) {
        socket.emit('move:invalid', { reason: 'Room not found' });
        return;
      }

      if (room.status === 'ended') {
        socket.emit('move:invalid', { reason: 'Game already ended' });
        return;
      }

      if (room.players.black) {
        socket.emit('move:invalid', { reason: 'Room is full' });
        return;
      }

      const player = {
        id: socket.id,
        name: 'Player 2',
        elo: 1200,
        socketId: socket.id,
      };

      const joinResult = joinRoom(payload.roomId, player);
      if (!joinResult) {
        socket.emit('move:invalid', { reason: 'Could not join room' });
        return;
      }

      socket.join(payload.roomId);

      // Notify the joining player
      socket.emit('room:joined', {
        roomId: payload.roomId,
        color: 'b',
        opponent: {
          id: room.players.white!.id,
          name: room.players.white!.name,
          elo: room.players.white!.elo,
        },
      });

      // Notify the white player
      io.to(payload.roomId).emit('room:player-joined', {
        playerName: player.name,
      });

      // Send current state to both
      io.to(payload.roomId).emit('room:state', {
        fen: room.game.fen(),
        turn: room.game.turn() === 'w' ? 'w' : 'b',
        moves: room.game.history(),
      });
    });

    // ── Move: Make ──
    socket.on('move:make', (payload) => {
      const room = getRoom(payload.roomId);
      if (!room) {
        socket.emit('move:invalid', { reason: 'Room not found' });
        return;
      }

      if (room.status !== 'playing') {
        socket.emit('move:invalid', { reason: 'Game is not active' });
        return;
      }

      // Verify it's this player's turn
      const currentTurn = room.game.turn() === 'w' ? 'w' : 'b';
      const playerColor =
        room.players.white?.socketId === socket.id
          ? 'w'
          : room.players.black?.socketId === socket.id
            ? 'b'
            : null;

      if (!playerColor || playerColor !== currentTurn) {
        socket.emit('move:invalid', { reason: 'Not your turn' });
        return;
      }

      // Validate move server-side
      const result = validateMove(
        room.game,
        payload.move.from,
        payload.move.to,
        payload.move.promotion,
      );

      if (!result.valid) {
        socket.emit('move:invalid', { reason: result.reason });
        return;
      }

      room.lastActivity = Date.now();

      // Broadcast applied move to all players
      io.to(payload.roomId).emit('move:applied', {
        move: {
          from: payload.move.from,
          to: payload.move.to,
          promotion: payload.move.promotion,
          san: result.san,
        },
        fen: result.fen,
        status: result.status,
      });

      // Check for game over
      if (result.result) {
        room.status = 'ended';
        room.result = result.result;
        room.endReason = result.endReason;

        io.to(payload.roomId).emit('game:ended', {
          result: result.result,
          reason: result.endReason!,
          pgn: result.pgn,
        });
      }
    });

    // ── Game: Resign ──
    socket.on('game:resign', (payload) => {
      const room = getRoom(payload.roomId);
      if (!room) return;

      const resigningColor =
        room.players.white?.socketId === socket.id
          ? 'w'
          : room.players.black?.socketId === socket.id
            ? 'b'
            : null;

      if (!resigningColor) return;

      room.status = 'ended';
      room.result = resigningColor === 'w' ? 'black' : 'white';
      room.endReason = 'resign';

      io.to(payload.roomId).emit('game:ended', {
        result: room.result,
        reason: 'resign',
        pgn: room.game.pgn(),
      });
    });

    // ── Game: Draw Offer ──
    socket.on('game:draw-offer', (payload) => {
      const room = getRoom(payload.roomId);
      if (!room) return;

      const offeringColor =
        room.players.white?.socketId === socket.id ? 'w' : 'b';

      room.drawOffer = { by: offeringColor };
      socket.to(payload.roomId).emit('game:draw-offered', { by: offeringColor });
    });

    // ── Game: Draw Accept ──
    socket.on('game:draw-accept', (payload) => {
      const room = getRoom(payload.roomId);
      if (!room || !room.drawOffer) return;

      room.status = 'ended';
      room.result = 'draw';
      room.endReason = 'draw_agreement';
      room.drawOffer = null;

      io.to(payload.roomId).emit('game:ended', {
        result: 'draw',
        reason: 'draw_agreement',
        pgn: room.game.pgn(),
      });
    });

    // ── Game: Draw Decline ──
    socket.on('game:draw-decline', (payload) => {
      const room = getRoom(payload.roomId);
      if (!room) return;
      room.drawOffer = null;
      socket.to(payload.roomId).emit('game:draw-declined');
    });

    // ── Disconnect ──
    socket.on('disconnect', () => {
      console.log(`[disconnect] ${socket.id}`);

      // Find which room(s) this socket was in
      for (const game of getActiveGames()) {
        const roomId = game.roomId;
        const fullRoom = getRoom(roomId);
        if (!fullRoom) continue;

        const disconnectedColor = disconnectPlayer(roomId, socket.id);
        if (!disconnectedColor) continue;

        if (fullRoom.status === 'playing') {
          // Give 60s to reconnect
          const timer = setTimeout(() => {
            const room = getRoom(roomId);
            if (room && room.status === 'playing') {
              // Player didn't reconnect — forfeit
              room.status = 'ended';
              room.result = disconnectedColor === 'w' ? 'black' : 'white';
              room.endReason = 'timeout';

              io.to(roomId).emit('game:ended', {
                result: room.result,
                reason: 'timeout',
                pgn: room.game.pgn(),
              });
            }
            disconnectTimers.delete(roomId);
          }, 60_000);

          disconnectTimers.set(
            `${roomId}:${socket.id}`,
            timer,
          );

          io.to(roomId).emit('player:disconnected', {
            color: disconnectedColor,
            timeout: 60,
          });
        }
      }
    });
  });

  // ── Cleanup empty rooms every 10 min ──
  setInterval(() => {
    for (const game of getActiveGames()) {
      const room = getRoom(game.roomId);
      if (
        room &&
        room.status === 'waiting' &&
        Date.now() - room.createdAt > 600_000
      ) {
        removeRoom(game.roomId);
      }
    }
  }, 600_000);

  server.listen(PORT, () => {
    console.log(`🚀 Server ready on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
