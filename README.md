# ♟️ Modern Chess 3D

[![CI](https://github.com/AtmanTest/modern-chess-3d/actions/workflows/ci.yml/badge.svg)](https://github.com/AtmanTest/modern-chess-3d/actions/workflows/ci.yml)
[![Deploy](https://github.com/AtmanTest/modern-chess-3d/actions/workflows/deploy.yml/badge.svg)](https://github.com/AtmanTest/modern-chess-3d/actions/workflows/deploy.yml)

Un jeu d'échecs 3D moderne, premium et production-ready.

## ✨ Fonctionnalités

- **🎮 Plateau 3D interactif** — React Three Fiber + Three.js, caméra orbitale, animations fluides, éclairage PBR
- **🤖 IA Stockfish 18** — NNUE, 10 niveaux de difficulté (depth 1→20) via WebAssembly
- **🌐 Multijoueur temps réel** — Socket.IO, rooms privées avec lien de partage, validation serveur
- **👤 Comptes utilisateurs** — Supabase Auth (email + OAuth GitHub/Google), profils, historique, classement Elo
- **📊 Classement Elo** — Algorithme standard (K=32), classement global
- **🎨 Thème sombre premium** — Plateau bois sombre / marbre noir + or, animations 3D

## 🏗️ Stack Technique

| Frontend | Backend | Infrastructure |
|----------|---------|---------------|
| Next.js 14 (App Router) | Node.js 20 | GitHub Actions |
| React 18 + TypeScript | Socket.IO 4.x | Render Web Service |
| React Three Fiber v8 | Supabase JS v2 | Render Cron Jobs |
| Three.js 0.184 | chess.js v1.x | Supabase Cloud |
| Zustand (state) | - | - |
| Tailwind CSS + shadcn/ui | - | - |

## 🚀 Démarrage Rapide

```bash
# 1. Cloner
git clone https://github.com/AtmanTest/modern-chess-3d.git
cd modern-chess-3d

# 2. Installer les dépendances
npm install

# 3. Copier et remplir les variables d'environnement
cp .env.example .env.local

# 4. Lancer le serveur de développement
npm run dev

# 5. Dans un autre terminal, lancer le serveur Socket.IO
npx tsx server/socket/server.ts
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## 📁 Structure du Projet

```
modern-chess-3d/
├── app/                  # Next.js App Router pages
├── components/
│   ├── chess3d/         # Plateau 3D + pièces R3F
│   ├── hud/             # Timer, historique, statut
│   └── ui/              # shadcn/ui composants
├── lib/
│   ├── chess/           # Moteur de règles (chess.js)
│   ├── ai/              # Stockfish WASM wrapper
│   ├── realtime/        # Socket.IO client
│   └── supabase/        # Client DB + auth
├── server/socket/       # Serveur Socket.IO custom
├── docs/                # Documentation technique
├── tests/               # Tests unitaires + e2e
└── .github/workflows/   # CI/CD
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests e2e (Playwright)
npx playwright test
```

## 📖 Documentation

- [Architecture](docs/architecture.md)
- [API Temps Réel](docs/api-realtime.md)
- [Schéma Supabase](docs/supabase-schema.md)
- [Déploiement](docs/deployment.md)
- [Cron Jobs](docs/cron-jobs.md)

## 📄 Licence

MIT
