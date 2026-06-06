// ─── Wrapper Stockfish WASM (Promise-based) ───
// Utilise le binaire lite-single-threaded de stockfish (nmrugg)
// ~7.3 MB, NNUE, pas de SharedArrayBuffer nécessaire

import { getUCIDepth, getSkillLevel } from './levels';

let worker: Worker | null = null;
let isReady = false;
let readyResolve: (() => void) | null = null;

// Attendre que Stockfish soit prêt (UCI handshake)
function waitForReady(): Promise<void> {
  return new Promise((resolve) => {
    if (isReady) {
      resolve();
    } else {
      readyResolve = resolve;
    }
  });
}

// Initialiser le worker Stockfish
export async function initStockfish(): Promise<void> {
  if (worker) return waitForReady();

  return new Promise((resolve, reject) => {
    try {
      // Copier les fichiers WASM dans /stockfish/ pour le serveur
      // Note: les fichiers doivent être placés dans public/stockfish/
      // via un script postinstall ou copie manuelle
      const stockfishPath = '/stockfish/stockfish-18-lite-single.js';

      worker = new Worker(stockfishPath);

      worker.onmessage = (e: MessageEvent) => {
        const msg = e.data as string;

        if (msg === 'readyok') {
          isReady = true;
          if (readyResolve) {
            readyResolve();
            readyResolve = null;
          }
          resolve();
        } else if (msg.startsWith('bestmove')) {
          // Will be handled by the calling function
        }
      };

      worker.onerror = (err) => {
        console.error('Stockfish worker error:', err);
        reject(new Error('Failed to initialize Stockfish worker'));
      };

      // Initialize UCI protocol
      worker.postMessage('uci');
      worker.postMessage('isready');
    } catch (err) {
      reject(err);
    }
  });
}

// Obtenir le meilleur coup pour une position FEN
export function getBestMove(
  fen: string,
  level: number = 5,
  timeMs: number = 2000
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      await waitForReady();

      if (!worker) {
        reject(new Error('Stockfish not initialized'));
        return;
      }

      const depth = getUCIDepth(level);
      const skill = getSkillLevel(level);

      let result: string | null = null;

      // Timeout de sécurité
      const timeout = setTimeout(() => {
        if (!result) {
          worker!.postMessage('stop');
          reject(new Error('Stockfish timeout'));
        }
      }, Math.min(timeMs + 1000, 6000));

      // Gérer la réponse
      const handler = (e: MessageEvent) => {
        const msg = e.data as string;

        if (msg.startsWith('bestmove')) {
          const parts = msg.split(' ');
          if (parts.length >= 2 && parts[1] !== '(none)') {
            result = parts[1];
            clearTimeout(timeout);
            worker!.removeEventListener('message', handler);
            resolve(result);
          } else {
            clearTimeout(timeout);
            worker!.removeEventListener('message', handler);
            reject(new Error('No valid move found'));
          }
        }
      };

      worker.addEventListener('message', handler);

      // Configurer le niveau
      worker.postMessage(`setoption name Skill Level value ${skill}`);
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${depth}`);
    } catch (err) {
      reject(err);
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
    isReady = false;
  }
}

// Vérifier si Stockfish est chargé
export function isStockfishReady(): boolean {
  return isReady && worker !== null;
}
