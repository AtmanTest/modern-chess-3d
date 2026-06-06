// ─── Wrapper Stockfish WASM (Promise-based) ───
// Utilise stockfish-18-lite-single.js (nmrugg) depuis public/stockfish/
// ~7 MB, NNUE, mono-thread, pas de SharedArrayBuffer nécessaire

import { getUCIDepth, getSkillLevel } from './levels';

let worker: Worker | null = null;
let isReady = false;
let initPromise: Promise<void> | null = null;

// Initialiser le worker Stockfish (appelé automatiquement par getBestMove)
export async function initStockfish(): Promise<void> {
  if (worker && isReady) return;
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve, reject) => {
    try {
      const stockfishPath = '/stockfish/stockfish-18-lite-single.js';

      worker = new Worker(stockfishPath);

      const timeout = setTimeout(() => {
        reject(new Error('Stockfish worker failed to respond (timeout)'));
      }, 15000);

      worker.onmessage = (e: MessageEvent) => {
        const msg = e.data as string;

        if (msg === 'readyok') {
          clearTimeout(timeout);
          isReady = true;
          resolve();
        } else if (msg.startsWith('id name')) {
          // Stockfish identification, ignore
        }
      };

      worker.onerror = (err) => {
        clearTimeout(timeout);
        console.error('Stockfish worker error:', err);
        // Clean up on error
        if (worker) {
          worker.terminate();
          worker = null;
        }
        initPromise = null;
        reject(new Error('Failed to initialize Stockfish worker: ' + (err.message || 'unknown error')));
      };

      worker.postMessage('uci');
      worker.postMessage('isready');
    } catch (err) {
      initPromise = null;
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });

  return initPromise;
}

// Obtenir le meilleur coup pour une position FEN
export async function getBestMove(
  fen: string,
  level: number = 5,
  timeMs: number = 3000
): Promise<string> {
  try {
    // Ensure Stockfish is initialized
    await initStockfish();
  } catch (initErr) {
    // If Stockfish fails to init, throw to let caller fall back
    throw new Error('Stockfish init failed: ' + (initErr instanceof Error ? initErr.message : String(initErr)));
  }

  return new Promise<string>((resolve, reject) => {
    if (!worker || !isReady) {
      reject(new Error('Stockfish not ready'));
      return;
    }

    const depth = getUCIDepth(level);
    const skill = getSkillLevel(level);

    let result: string | null = null;
    let bestmoveReceived = false;

    const timeout = setTimeout(() => {
      if (!bestmoveReceived) {
        worker!.postMessage('stop');
        reject(new Error(`Stockfish timeout (level ${level}, depth ${depth}, ${timeMs}ms)`));
      }
    }, Math.min(timeMs + 1000, 6000));

    const handler = (e: MessageEvent) => {
      const msg = e.data as string;

      if (msg.startsWith('bestmove')) {
        const parts = msg.split(' ');
        if (parts.length >= 2 && parts[1] !== '(none)') {
          result = parts[1];
          bestmoveReceived = true;
          clearTimeout(timeout);
          worker!.removeEventListener('message', handler);
          resolve(result);
        } else if (parts.length >= 2 && parts[1] === '(none)') {
          bestmoveReceived = true;
          clearTimeout(timeout);
          worker!.removeEventListener('message', handler);
          reject(new Error('No valid move found by Stockfish'));
        }
      } else if (msg.startsWith('info')) {
        // Stockfish is thinking — we can ignore these or log them
        // Could extract "info depth X" for progress feedback
      }
    };

    worker.addEventListener('message', handler);

    try {
      worker.postMessage(`setoption name Skill Level value ${skill}`);
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${depth}`);
    } catch (postErr) {
      clearTimeout(timeout);
      worker.removeEventListener('message', handler);
      reject(new Error('Failed to send command to Stockfish: ' + String(postErr)));
    }
  });
}

// Arrêter le calcul en cours
export function stopStockfish(): void {
  if (worker && isReady) {
    worker.postMessage('stop');
  }
}

// Terminer le worker proprement
export function destroyStockfish(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  isReady = false;
  initPromise = null;
}

// Vérifier si Stockfish est chargé
export function isStockfishReady(): boolean {
  return isReady && worker !== null;
}
