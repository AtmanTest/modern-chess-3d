# API Temps Réel — Socket.IO Events

## Connexion

```typescript
import { connectSocket } from '@/lib/realtime/socket';
const socket = connectSocket();
```

## Événements Client → Serveur

### `room:create`

Créer une nouvelle room multijoueur.

```typescript
socket.emit('room:create', {
  timeControl: 'blitz',    // 'bullet' | 'blitz' | 'rapid' | 'unlimited'
  color: 'w',              // 'w' | 'b'
});
```

### `room:join`

Rejoindre une room existante.

```typescript
socket.emit('room:join', {
  roomId: 'abc12345',
});
```

### `move:make`

Jouer un coup.

```typescript
socket.emit('move:make', {
  roomId: 'abc12345',
  move: { from: 'e2', to: 'e4' },
  fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
});
```

### `game:resign`

Abandonner la partie.

```typescript
socket.emit('game:resign', { roomId: 'abc12345' });
```

### `game:draw-offer` / `game:draw-accept` / `game:draw-decline`

Proposer, accepter ou refuser une nulle.

```typescript
socket.emit('game:draw-offer', { roomId: 'abc12345' });
socket.emit('game:draw-accept', { roomId: 'abc12345' });
socket.emit('game:draw-decline', { roomId: 'abc12345' });
```

## Événements Serveur → Client

### `room:created`

```typescript
socket.on('room:created', (data) => {
  // data: { roomId: 'abc12345', shareUrl: '/play/abc12345' }
});
```

### `room:joined`

```typescript
socket.on('room:joined', (data) => {
  // data: { roomId: 'abc12345', color: 'b', opponent: { id, name, elo } }
});
```

### `move:applied`

```typescript
socket.on('move:applied', (data) => {
  // data: { move: { from, to, san }, fen, status }
});
```

### `game:ended`

```typescript
socket.on('game:ended', (data) => {
  // data: { result: 'white'|'black'|'draw', reason: 'checkmate'|'resign'|..., pgn }
});
```

### `player:disconnected` / `player:reconnected`

```typescript
socket.on('player:disconnected', (data) => {
  // data: { color: 'w', timeout: 60 }  // 60s pour se reconnecter
});

socket.on('player:reconnected', (data) => {
  // data: { color: 'w' }
});
```
