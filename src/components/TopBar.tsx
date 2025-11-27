import React from 'react';
import { Trophy, Home } from 'lucide-react';

interface TopBarProps {
  title: string;
  matchId?: string;
  onLeaderboardClick?: () => void;
  onHomeClick?: () => void;
}

export function TopBar({ title, matchId, onLeaderboardClick, onHomeClick }: TopBarProps) {
  return (
    <div
      className="w-full px-6 py-4 bg-white shadow-lg rounded-b-3xl flex items-center justify-between"
      style={{
        border: '4px solid rgba(255, 255, 255, 0.5)',
        borderTop: 'none',
      }}
    >
      <button
        onClick={onHomeClick}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6BCB77] to-[#5BB967] flex items-center justify-center shadow-lg hover:scale-110 transform transition-all"
      >
        <Home className="text-white" size={24} />
      </button>

      <div className="flex-1 text-center">
        <h2
          className="text-3xl"
          style={{
            background: 'linear-gradient(135deg, #4D96FF 0%, #6BCB77 50%, #FFD93D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </h2>
        {matchId && (
          <div className="text-sm text-gray-500 mt-1">Match #{matchId}</div>
        )}
      </div>

      <button
        onClick={onLeaderboardClick}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD93D] to-[#FFC72D] flex items-center justify-center shadow-lg hover:scale-110 transform transition-all"
      >
        <Trophy className="text-white" size={24} />
      </button>
    </div>
  );
}
