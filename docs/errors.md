# Log des Erreurs — Modern Chess 3D

| Date | Erreur | Cause | Solution |
|------|--------|-------|----------|
| Phase 1 | Build échoué (conflit route `/`) | `app/page.tsx` et `app/(game)/page.tsx` définissaient la même route | Supprimé le doublon `app/(game)/page.tsx` |
| Phase 4 | ESLint: `THREE` unused | `import * as THREE` importé mais non utilisé dans certains composants | Retiré les imports superflus |
| Phase 4 | Type error: `shadow` prop | R3F n'accepte pas d'objet brut pour `shadow` sur `<directionalLight>` | Remplacé par les props individuelles `shadow-*` |
| Phase 5 | `roomId` not found | Changement de boucle `for...of` sans mise à jour des références internes | Remplacé `roomId` par `game.roomId` et re-déclaré la variable en début de boucle |
| Phase 5 | Type error `'draw'` not assignable | `EndReason` n'inclut pas `'draw'` comme valeur littérale | Retourné `null` à la place |
| Phase 5 | Type error `'white'|'black'` not assignable to `Color` | `disconnectPlayer()` retournait les valeurs du tableau `['white','black']` au lieu de `'w'|'b'` | Ajouté un mapping `color === 'white' ? 'w' : 'b'` |
| Phase 5 | TypeScript errors with `getActiveGames()` | La fonction retourne un tableau, pas des Map entries | Changé les boucles pour utiliser `for (const game of ...)` et `game.roomId` |
| Phase 6 | ESLint: `any` dans le callback | `as any` sur les appels Supabase | Ajouté `eslint-disable-next-line` |
| Phase 6 | Build crash (Supabase missing env) | Pages d'auth client-side générées statiquement sans Supabase | Ajout de `.env.local` avec placeholders |
