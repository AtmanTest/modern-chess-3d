'use client';

import { useEffect, useRef, useState } from 'react';

interface ChessTimerProps {
  initialMs: number;
  isActive: boolean;
  onTimeout?: () => void;
  direction?: 'up' | 'down';
  label?: string;
}

export default function ChessTimer({
  initialMs,
  isActive,
  onTimeout,
  direction = 'down',
  label,
}: ChessTimerProps) {
  const [displayMs, setDisplayMs] = useState(initialMs);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const initialMsRef = useRef(initialMs);

  // Reset when initialMs changes
  useEffect(() => {
    setDisplayMs(initialMs);
    initialMsRef.current = initialMs;
  }, [initialMs]);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const next = direction === 'down'
          ? Math.max(0, initialMsRef.current - elapsed)
          : initialMsRef.current + elapsed;

        setDisplayMs(next);

        if (direction === 'down' && next <= 0) {
          clearInterval(intervalRef.current!);
          onTimeout?.();
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, direction, onTimeout]);

  const formatTime = (ms: number) => {
    if (ms === Infinity) return '--:--';
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const isLow = direction === 'down' && displayMs < 60000;

  return (
    <div className="text-center">
      {label && <div className="text-xs text-gray-500 mb-1">{label}</div>}
      <div
        className={`text-3xl font-mono font-bold tabular-nums ${
          isLow ? 'text-red-400 animate-pulse' : 'text-white'
        }`}
      >
        {formatTime(displayMs)}
      </div>
    </div>
  );
}
