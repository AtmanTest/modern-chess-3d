# Schéma Supabase — Modern Chess 3D

## Diagramme ER

```
┌──────────────────┐
│   auth.users     │
├──────────────────┤
│ id (PK)          │──┐
│ email            │  │
│ created_at       │  │
└──────────────────┘  │
                      │
┌─────────────────────┘
│
▼
┌──────────────────┐       ┌──────────────────┐
│    profiles      │       │      games       │
├──────────────────┤       ├──────────────────┤
│ id (PK, FK)      │──┐    │ id (PK)          │
│ username (UQ)    │  │    │ white_id (FK)    │──▶ profiles.id
│ avatar_url       │  │    │ black_id (FK)    │──▶ profiles.id
│ elo              │  │    │ mode             │
│ games_played     │  │    │ time_control     │
│ wins             │  │    │ result           │
│ losses           │  │    │ end_reason       │
│ draws            │  │    │ pgn              │
│ created_at       │  │    │ fen_final        │
└──────────────────┘  │    │ ai_level         │
                      │    │ started_at       │
                      │    │ ended_at         │
                      │    └────────┬─────────┘
                      │             │
                      │             │
                      │    ┌────────▼─────────┐
                      │    │      moves       │
                      │    ├──────────────────┤
                      │    │ id (PK)          │
                      └────│ game_id (FK)     │──▶ games.id
                           │ move_number      │
                           │ notation         │
                           │ fen              │
                           │ played_at        │
                           └──────────────────┘
```

## SQL de Création

```sql
-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profils utilisateurs
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  elo         INTEGER DEFAULT 1200,
  games_played INTEGER DEFAULT 0,
  wins        INTEGER DEFAULT 0,
  losses      INTEGER DEFAULT 0,
  draws       INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parties
CREATE TABLE games (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  white_id      UUID REFERENCES profiles(id),
  black_id      UUID REFERENCES profiles(id),
  mode          TEXT NOT NULL,
  time_control  TEXT,
  result        TEXT,
  end_reason    TEXT,
  pgn           TEXT,
  fen_final     TEXT,
  ai_level      INTEGER,
  started_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at      TIMESTAMP WITH TIME ZONE
);

-- Coups
CREATE TABLE moves (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id     UUID REFERENCES games(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  notation    TEXT NOT NULL,
  fen         TEXT NOT NULL,
  played_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;

-- Profiles : chaque utilisateur peut lire/éditer son propre profil
CREATE POLICY "profiles_self" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Games : les participants peuvent voir leur partie
CREATE POLICY "games_participants" ON games
  FOR SELECT USING (auth.uid() = white_id OR auth.uid() = black_id);

-- Games : insert autorisé pour tout joueur authentifié
CREATE POLICY "games_insert" ON games
  FOR INSERT WITH CHECK (auth.uid() = white_id);

-- Moves : lecture publique (replay)
CREATE POLICY "moves_public_read" ON moves
  FOR SELECT USING (true);
```
