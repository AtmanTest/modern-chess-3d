# Cron Jobs — Modern Chess 3D

## Jobs Actifs

| Nom | Schedule | Commande | Description | Env Requis |
|-----|----------|----------|-------------|------------|
| `cleanup-expired-games` | `0 * * * *` (chaque heure) | `node scripts/cleanup.js` | Marque les parties >2h comme abandonnées + nettoie rooms in-memory | `SUPABASE_SERVICE_ROLE_KEY` |
| `recalculate-leaderboard` | `0 0 * * *` (minuit) | `node scripts/leaderboard.js` | Recalcule Elo, wins/losses/draws pour tous les joueurs actifs | `SUPABASE_SERVICE_ROLE_KEY` |

## Détail des Scripts

### `scripts/cleanup.js`

- **Schedule** : `0 * * * *`
- **Logique** :
  1. Récupère les parties `started` depuis >2h
  2. Les marque comme terminées (abandon)
  3. Les rooms in-memory expirent via TTL (30 min) dans `roomManager.ts`
- **Fallback** : Si Supabase non configuré, log seulement

### `scripts/leaderboard.js`

- **Schedule** : `0 0 * * *`
- **Logique** :
  1. Récupère toutes les parties terminées
  2. Agrège les stats par joueur
  3. Recalcule Elo (K=16)
  4. Met à jour chaque profil
- **Fallback** : Si Supabase non configuré, skip

## Variables Requises

Les cron jobs Render doivent avoir ces variables d'environnement configurées :
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
