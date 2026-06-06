'use client';

interface PlayerCardProps {
  name: string;
  elo: number;
  color: 'w' | 'b';
  avatarUrl?: string;
  timeMs: number;
  isActive: boolean;
}

export default function PlayerCard({ name, elo, color, avatarUrl, timeMs, isActive }: PlayerCardProps) {
  const formattedTime = timeMs === Infinity
    ? '--:--'
    : `${Math.floor(timeMs / 60000)}:${String(Math.floor((timeMs % 60000) / 1000)).padStart(2, '0')}`;

  return (
    <div className={`glass-panel p-3 flex items-center gap-3 transition-all ${isActive ? 'ring-1 ring-amber-500/50 glow-gold' : ''}`}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          color === 'w' ? '♔' : '♚'
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-white truncate">{name}</span>
          <span className={`w-2 h-2 rounded-full ${color === 'w' ? 'bg-white border border-gray-500' : 'bg-gray-900 border border-gray-600'}`} />
        </div>
        <span className="text-xs text-gray-400">Elo {elo}</span>
      </div>

      {/* Timer */}
      <div className={`text-lg font-mono font-bold tabular-nums ${timeMs < 60000 ? 'text-red-400' : 'text-white'}`}>
        {formattedTime}
      </div>
    </div>
  );
}
