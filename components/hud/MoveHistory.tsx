'use client';

import { useRef, useEffect } from 'react';

interface MoveHistoryProps {
  moves: string[];
  currentMoveIndex?: number;
  onMoveClick?: (index: number) => void;
}

export default function MoveHistory({ moves, currentMoveIndex, onMoveClick }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  // Group moves into pairs
  const rows: { num: number; white: string; black: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1] || '',
    });
  }

  if (moves.length === 0) {
    return (
      <div className="glass-panel p-3 h-full flex items-center justify-center">
        <p className="text-gray-500 text-xs">Aucun coup joué</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-2 h-full flex flex-col">
      <div className="text-xs text-gray-500 font-medium px-2 pb-1 border-b border-white/5">
        Historique
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin mt-1"
        style={{ maxHeight: 200 }}
      >
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[2rem_1fr_1fr] gap-1 text-xs px-2 py-0.5 hover:bg-white/5 rounded"
          >
            <span className="text-gray-500 text-right">{row.num}.</span>
            <span
              className={`cursor-pointer ${currentMoveIndex === idx * 2 ? 'text-amber-400 font-semibold' : 'text-gray-300 hover:text-white'}`}
              onClick={() => onMoveClick?.(idx * 2)}
            >
              {row.white}
            </span>
            <span
              className={`cursor-pointer ${currentMoveIndex === idx * 2 + 1 ? 'text-amber-400 font-semibold' : 'text-gray-300 hover:text-white'}`}
              onClick={() => onMoveClick?.(idx * 2 + 1)}
            >
              {row.black}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
