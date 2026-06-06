// ─── Script de nettoyage : parties expirées / rooms Socket.IO ───
// Exécuté par Render Cron Job chaque heure (0 * * * *)

/**
 * Nettoie les parties inactives :
 * 1. Marque les parties "started" depuis >2h comme abandonnées
 * 2. Log les stats de nettoyage
 *
 * Note : Les rooms Socket.IO en mémoire expirent automatiquement
 * via le TTL dans roomManager.ts (30 min).
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

async function cleanup() {
  console.log(`[cleanup] Starting at ${new Date().toISOString()}`);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log('[cleanup] Supabase not configured — skipping DB cleanup');
    console.log('[cleanup] Cleanup complete (in-memory only)');
    return;
  }

  try {
    const cutoff = new Date(Date.now() - TWO_HOURS_MS).toISOString();

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/cleanup_expired_games`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ cutoff }),
      },
    );

    if (response.ok) {
      const result = await response.json();
      console.log(`[cleanup] Expired games cleaned: ${JSON.stringify(result)}`);
    } else {
      console.error(`[cleanup] API error: ${response.status} ${response.statusText}`);
    }
  } catch (err) {
    console.error('[cleanup] Error:', err instanceof Error ? err.message : String(err));
  }

  console.log('[cleanup] Cleanup complete');
}

cleanup();
