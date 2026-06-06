# Guide de Déploiement — Modern Chess 3D

## Architecture de Déploiement

```
GitHub (source) → Render Web Service (Node + Next.js + Socket.IO)
                → Render Cron Jobs (maintenance)
```

## Services Render

### 1. Web Service — `chess-app`

| Propriété | Valeur |
|-----------|--------|
| Type | Web Service (Node) |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` (→ `tsx server/socket/server.ts`) |
| Plan | Starter ($7/mo) ou Free |
| Auto-Deploy | Oui (branch `main`) |

### 2. Cron Job — `cleanup-expired-games`

| Propriété | Valeur |
|-----------|--------|
| Schedule | `0 * * * *` (chaque heure) |
| Command | `node scripts/cleanup.js` |

### 3. Cron Job — `recalculate-leaderboard`

| Propriété | Valeur |
|-----------|--------|
| Schedule | `0 0 * * *` (chaque nuit à minuit) |
| Command | `node scripts/leaderboard.js` |

## Variables d'Environnement

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Oui |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase (anon) | Oui |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase (pour cron/admin) | Pour cron |
| `NEXT_PUBLIC_SOCKET_URL` | URL du serveur Socket.IO (optionnel, auto-détecté) | Non |
| `NODE_ENV` | `production` | Oui |

## Headers Custom (requis pour Stockfish WASM)

Dans Render Dashboard → Web Service → Settings → HTTP Headers :

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## Déploiement Automatique

1. Configurer le GitHub App sur Render
2. Connecter le repo `AtmanTest/modern-chess-3d`
3. Configurer le Deploy Hook dans GitHub Secrets : `RENDER_DEPLOY_HOOK_URL`

### Pipeline CI/CD

```
push → GitHub Actions (lint + test + build)
     → push main → Render Deploy Hook → auto-deploy
```

## Étapes de Déploiement Manuel

1. Configurer Supabase :
   - Créer un projet sur [supabase.com](https://supabase.com)
   - Exécuter le schéma SQL (voir `docs/supabase-schema.md`)
   - Activer Auth providers (Email, GitHub, Google)

2. Déployer sur Render :
   - Créer un Web Service (Node)
   - Ajouter les variables d'environnement
   - Déployer

3. Configurer les Cron Jobs sur Render :
   - Créer cron jobs avec les schedules ci-dessus

## URLs de Production

- Site : `https://modern-chess-3d.onrender.com`
- GitHub : `https://github.com/AtmanTest/modern-chess-3d`
