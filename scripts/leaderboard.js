// ─── Script de recalcul du classement ───
// Exécuté par Render Cron Job chaque nuit à minuit (0 0 * * *)

/**
 * Recalcule les classements Elo et stats agrégées.
 * 
 * Pour chaque joueur qui a joué au moins une partie :
 * 1. Récupère toutes ses parties terminées
 * 2. Recalcule Elo basé sur les résultats
 * 3. Met à jour wins/losses/draws/games_played
 *
 * Note : Nécessite que SUPABASE_SERVICE_ROLE_KEY soit configurée.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function recalculateLeaderboard() {
  console.log(`[leaderboard] Recalculating at ${new Date().toISOString()}`);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log('[leaderboard] Supabase not configured — skipping');
    return;
  }

  try {
    // Fetch all completed games
    const gamesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/games?select=white_id,black_id,result,end_reason&result=not.is.null`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      },
    );

    if (!gamesResponse.ok) {
      console.error(`[leaderboard] Failed to fetch games: ${gamesResponse.status}`);
      return;
    }

    const games = await gamesResponse.json();
    console.log(`[leaderboard] Processing ${games.length} completed games`);

    // Aggregate stats per player
    const stats = {};

    for (const game of games) {
      if (game.result === 'draw') {
        stats[game.white_id] = stats[game.white_id] || { wins: 0, losses: 0, draws: 0, games: 0 };
        stats[game.black_id] = stats[game.black_id] || { wins: 0, losses: 0, draws: 0, games: 0 };
        stats[game.white_id].draws++;
        stats[game.black_id].draws++;
      } else if (game.result === 'white') {
        stats[game.white_id] = stats[game.white_id] || { wins: 0, losses: 0, draws: 0, games: 0 };
        stats[game.black_id] = stats[game.black_id] || { wins: 0, losses: 0, draws: 0, games: 0 };
        stats[game.white_id].wins++;
        stats[game.black_id].losses++;
      } else if (game.result === 'black') {
        stats[game.white_id] = stats[game.white_id] || { wins: 0, losses: 0, draws: 0, games: 0 };
        stats[game.black_id] = stats[game.black_id] || { wins: 0, losses: 0, draws: 0, games: 0 };
        stats[game.white_id].losses++;
        stats[game.black_id].wins++;
      }
      if (stats[game.white_id]) stats[game.white_id].games++;
      if (stats[game.black_id]) stats[game.black_id].games++;
    }

    // Update each player's profile
    let updated = 0;
    for (const [playerId, playerStats] of Object.entries(stats)) {
      const eloChange = playerStats.wins * 16 - playerStats.losses * 16;
      const newElo = Math.max(100, 1200 + eloChange);

      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${playerId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({
            elo: newElo,
            wins: playerStats.wins,
            losses: playerStats.losses,
            draws: playerStats.draws,
            games_played: playerStats.games,
          }),
        },
      );

      if (updateResponse.ok) updated++;
    }

    console.log(`[leaderboard] Updated ${updated}/${Object.keys(stats).length} profiles`);
  } catch (err) {
    console.error('[leaderboard] Error:', err instanceof Error ? err.message : String(err));
  }

  console.log('[leaderboard] Recalculation complete');
}

recalculateLeaderboard();
