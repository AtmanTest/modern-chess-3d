# Décisions d'Architecture — Modern Chess 3D

## Librairies

| Choix | Alternative(s) | Raison |
|-------|----------------|--------|
| **chess.js v1.x** | kokopu, cm-chess | TypeScript natif, maintenance active (1.5k+ stars), API stable, large adoption |
| **Stockfish WASM (nmrugg lite)** | stockfish.js, lila-stockfish-wasm | ~7.3MB, single-threaded, pas de SharedArrayBuffer → pas de COOP/COEP nécessaire |
| **React Three Fiber v8 + drei v9** | Babylon.js, raw Three.js | Compatible React 18/Next.js 14, déclaratif, ecosysteme mature |
| **Socket.IO 4.x** | Ably, Pusher, Supabase Realtime | Gratuit, faible latence, rooms + events typés, déploiement simple sur Render |
| **Supabase** | Firebase, PlanetScale, Neon | Auth + DB + RLS intégrés, gratuit pour commencer, PostgreSQL natif |
| **Zustand** | Redux, Jotai, useContext | Minimal boilerplate, React 18 compatible, TypeScript first |

## Architecture Backend

- **Custom Server** : Next.js est embarqué dans un serveur Node.js custom (Express-like) pour partager le port HTTP avec Socket.IO.
- **State des parties** : En mémoire (Map dans roomManager.ts) pour la latence zéro. Les parties terminées sont persistées dans Supabase.
- **Validation anti-triche** : Chaque coup reçu par WebSocket est re-validé côté serveur avec chess.js.

## Rendu 3D

- **Pièces procédurales** : Géométries Three.js (cylindres, sphères, cônes) au lieu de modèles GLTF pour éviter des assets externes.
- **Fallback 2D** : Composant `<ChessBoard2D>` activé si WebGL2 est indisponible.
- **Lazy loading** : Tous les composants R3F sont chargés avec `dynamic(() => import(...), { ssr: false })`.

## Stockfish WASM

- **Niveau → Profondeur** : `level 1 → depth 1` (débutant) à `level 10 → depth 20` (expert).
- **Timeout** : 5s max par coup pour ne pas bloquer l'UI. Fallback minimax en JS pur si WASM non dispo.
- **Web Worker** : Stockfish tourne dans un Worker séparé pour ne pas bloquer le thread principal.
