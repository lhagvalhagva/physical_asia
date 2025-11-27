import React from 'react';
import { Trophy, Home } from 'lucide-react';

interface TopBarProps {
  title: string;
  matchId?: string;
  onLeaderboardClick?: () => void;
  onHomeClick?: () => void;
  timeLeft?: number;
  formatTime?: (seconds: number) => string;
}

export function TopBar({ title, matchId, onLeaderboardClick, onHomeClick, timeLeft, formatTime }: TopBarProps) {
  return (
    <div
      className="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-white shadow-lg rounded-b-xl sm:rounded-b-2xl md:rounded-b-3xl flex items-center justify-between"
      style={{
        border: '2px solid rgba(255, 255, 255, 0.5)',
        borderTop: 'none',
      }}
    >
      <button
        onClick={onHomeClick}
        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#6BCB77] to-[#5BB967] flex items-center justify-center shadow-lg active:scale-95 sm:hover:scale-110 transform transition-all touch-manipulation"
      >
        <Home className="text-white" size={18} />
      </button>

      <div className="flex-1 text-center px-2">
        <h2
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl"
          style={{
            background: 'linear-gradient(135deg, #4D96FF 0%, #6BCB77 50%, #FFD93D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </h2>
        {matchId && (
          <div className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Match #{matchId}</div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {timeLeft !== undefined && formatTime && (
          <div className="bg-white text-black rounded-lg sm:rounded-xl md:rounded-2xl px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 flex flex-col items-center gap-0.5 shadow-lg border-2 border-slate-300">
            <div className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-600">⏳ Цаг</div>
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-mono font-bold text-black">{formatTime(timeLeft)}</div>
          </div>
        )}
        <button
          onClick={onLeaderboardClick}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#FFD93D] to-[#FFC72D] flex items-center justify-center shadow-lg active:scale-95 sm:hover:scale-110 transform transition-all touch-manipulation"
        >
          <Trophy className="text-white" size={18} />
        </button>
      </div>
    </div>
  );
}
