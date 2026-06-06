'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Chess } from 'chess.js';
import { getBestMove, isStockfishReady } from '@/lib/ai/stockfish';
import { getFallbackMoveUCI } from '@/lib/ai/fallback';
import type { Square } from '@/lib/chess/types';

const BoardScene = dynamic(
  () => import('@/components/chess3d/BoardScene'),
  { ssr: false },
);

const GAME_MSG = {
  active:     { text: 'Jouez', color: 'text-gray-300' },
  check:      { text: '⚠️ Échec !', color: 'text-red-400 animate-pulse' },
  checkmate:  { text: '🏆 Échec et Mat !', color: 'text-amber-400' },
  stalemate:  { text: '🤝 Pat ! Partie nulle.', color: 'text-yellow-400' },
  draw:       { text: '🤝 Partie nulle.', color: 'text-yellow-400' },
};

export default function VsAIPage() {
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [isAIThinking, setAIThinking] = useState(false);
  const [gameMsg, setGameMsg] = useState(GAME_MSG.active);
  const [gameOver, setGameOver] = useState(false);
  const [aiLevel, setAiLevel] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const stockfishInitRef = useRef(false);

  // Init Stockfish une seule fois
  useEffect(() => {
    if (stockfishInitRef.current) return;
    stockfishInitRef.current = true;
    import('@/lib/ai/stockfish').then(m => m.initStockfish()).catch(() => {});
  }, []);

  const updateGameStatus = useCallback((c: Chess) => {
    if (c.isCheckmate()) {
      setGameMsg(GAME_MSG.checkmate);
      setGameOver(true);
    } else if (c.isStalemate()) {
      setGameMsg(GAME_MSG.stalemate);
      setGameOver(true);
    } else if (c.isDraw()) {
      setGameMsg(GAME_MSG.draw);
      setGameOver(true);
    } else if (c.isCheck()) {
      setGameMsg(GAME_MSG.check);
    } else {
      setGameMsg(GAME_MSG.active);
    }
  }, []);

  const applyMove = useCallback((from: string, to: string, promotion?: string) => {
    chess.move({ from: from as Square, to: to as Square, promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined });
    setFen(chess.fen());
    setLastMove({ from, to });
    const hist = chess.history();
    setMoveHistory([...hist]);
    updateGameStatus(chess);
  }, [chess, updateGameStatus]);

  const doAIMove = useCallback(async () => {
    if (chess.isGameOver() || isAIThinking) return;
    setAIThinking(true);
    setError(null);

    try {
      let uci: string | null = null;

      // Essayer Stockfish d'abord
      if (isStockfishReady()) {
        try {
          uci = await getBestMove(chess.fen(), aiLevel, 3000);
        } catch {
          uci = null;
        }
      }

      // Fallback minimax
      if (!uci) {
        const depth = aiLevel <= 3 ? 2 : aiLevel <= 6 ? 3 : 4;
        uci = getFallbackMoveUCI(chess.fen(), depth);
      }

      if (!uci || uci.length < 4) {
        throw new Error('Aucun coup trouvé');
      }

      const from = uci.slice(0, 2);
      const to = uci.slice(2, 4);
      const promo = uci.length > 4 ? uci[4] : undefined;
      applyMove(from, to, promo);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur IA');
    } finally {
      setAIThinking(false);
    }
  }, [chess, aiLevel, applyMove, isAIThinking]);

  const handleSquareClick = useCallback((sq: string) => {
    if (isAIThinking || gameOver) return;
    // Tour des blancs uniquement (joueur)
    if (chess.turn() !== 'w') return;

    if (!selectedSquare) {
      // Sélection d'une pièce
      const piece = chess.get(sq as Square);
      if (piece && piece.color === 'w') {
        setSelectedSquare(sq);
        const moves = chess.moves({ square: sq as Square, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      }
      return;
    }

    // Vérifier si on clique sur une autre de ses pièces (re-sélection)
    const clickedPiece = chess.get(sq as Square);
    if (clickedPiece && clickedPiece.color === 'w' && sq !== selectedSquare) {
      setSelectedSquare(sq);
      const moves = chess.moves({ square: sq as Square, verbose: true });
      setLegalMoves(moves.map(m => m.to));
      return;
    }

    // Déplacement vers une case légale
    if (legalMoves.includes(sq)) {
      try {
        applyMove(selectedSquare, sq);
        setError(null);
        // Lancer l'IA si la partie continue
        if (!chess.isGameOver()) {
          setTimeout(() => doAIMove(), 100);
        }
      } catch {
        setError('Coup invalide');
      }
    }

    // Nettoyer la sélection
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [selectedSquare, legalMoves, isAIThinking, gameOver, chess, applyMove, doAIMove]);

  const newGame = useCallback(() => {
    chess.reset();
    setFen(chess.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
    setLastMove(null);
    setGameOver(false);
    setGameMsg(GAME_MSG.active);
    setError(null);
    setAIThinking(false);
  }, [chess]);

  const resign = useCallback(() => {
    setGameMsg({ text: '🏆 Vous avez abandonné', color: 'text-red-400' });
    setGameOver(true);
  }, []);

  const msg = gameMsg;

  // Formater les coups en notation lisible
  const movePairs: string[] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    const num = Math.floor(i / 2) + 1;
    const w = moveHistory[i] || '';
    const b = moveHistory[i + 1] || '';
    movePairs.push(`${num}. ${w}${b ? ` ${b}` : ''}`);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden select-none">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-2 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <h1 className="text-sm font-bold">
          <span className="text-amber-400">♚</span> IA Chess
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500">Niveau</span>
          <select
            value={aiLevel}
            onChange={e => setAiLevel(Number(e.target.value))}
            disabled={isAIThinking}
            className="bg-white/10 text-white text-[11px] rounded px-1.5 py-1 border border-white/10"
          >
            {[
              { v: 1, l: 'Débutant' },
              { v: 3, l: 'Facile' },
              { v: 5, l: 'Intermédiaire' },
              { v: 7, l: 'Difficile' },
              { v: 10, l: 'Expert' },
            ].map(o => (
              <option key={o.v} value={o.v}>{o.l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="fixed top-11 left-2 right-2 z-50 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] rounded px-2 py-1 text-center">
          {error}
        </div>
      )}

      {/* 3D Board — full screen */}
      <div className="fixed inset-0 top-12 bottom-16">
        <BoardScene
          fen={fen}
          onSquareClick={handleSquareClick}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          flipped={flipped}
        />
      </div>

      {/* Bottom bar — status + history + controls */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-t border-white/10">
        {/* Status */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
          <div className={`text-xs font-semibold ${msg.color}`}>
            {msg.text}
          </div>
          {isAIThinking && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] text-gray-400">IA réfléchit...</span>
            </div>
          )}
        </div>

        {/* History + Controls */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none text-[11px] text-gray-400 font-mono">
            {movePairs.length === 0 ? (
              <span className="text-gray-600">Jouez votre premier coup</span>
            ) : (
              movePairs.join('  ')
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            {gameOver ? (
              <button onClick={newGame}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-semibold rounded transition-all">
                Nouvelle Partie
              </button>
            ) : (
              <>
                <button onClick={resign}
                  className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] rounded border border-red-500/20 transition-all">
                  Abandonner
                </button>
                <button onClick={() => setFlipped(f => !f)}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-400 text-[11px] rounded border border-white/10 transition-all">
                  🔄 Retourner
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
