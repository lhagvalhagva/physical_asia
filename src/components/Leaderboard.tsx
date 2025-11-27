import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { PlayfulButton } from './PlayfulButton';
import { leaderboardService } from '../api/services/leaderboard';
import { authService } from '../api/services/auth';
import type { LeaderboardEntry } from '../types/api';

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'game'>('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameType, setGameType] = useState<string>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, gameType]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (activeTab === 'global') {
        response = await leaderboardService.getGlobal(100, true);
      } else {
        if (gameType === 'all') {
          response = await leaderboardService.getGlobal(100, true);
        } else {
          const gameTypeMap: Record<string, string> = {
            'tug-of-war': 'tug-of-war',
            'water-balloon': 'water-balloon',
            'cargo-push': 'cargo-push',
          };
          response = await leaderboardService.getGame(gameTypeMap[gameType] || gameType, 100);
        }
      }

      if (response.success && response.data) {
        setLeaderboard(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Leaderboard ачаалахад алдаа гарлаа');
      // Fallback to empty array
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-[#FFD93D]" size={32} />;
    if (rank === 2) return <Medal className="text-gray-400" size={28} />;
    if (rank === 3) return <Award className="text-[#CD7F32]" size={28} />;
    return <div className="w-8 h-8 flex items-center justify-center text-gray-600 font-bold">{rank}</div>;
  };

  const getCardGradient = (rank: number) => {
    if (rank === 1) return 'from-[#FFD93D] to-[#FFC72D]';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-[#CD7F32] to-[#B87333]';
    return 'from-white to-gray-50';
  };

  const currentPlayerId = authService.getPlayerId();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#E0F7FA] to-[#B2EBF2] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="text-center mb-4 sm:mb-6">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 50%, #6BCB77 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🏆 Leaderboard 🏆
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
          <button
            onClick={() => {
              setActiveTab('global');
              setGameType('all');
            }}
            className={`
              flex-1 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 text-sm sm:text-base touch-manipulation
              ${activeTab === 'global' 
                ? 'bg-gradient-to-br from-[#4D96FF] to-[#3B7FE8] text-white shadow-lg scale-105' 
                : 'bg-white text-gray-600 active:scale-95 sm:hover:scale-105'
              }
            `}
          >
            Global
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`
              flex-1 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 text-sm sm:text-base touch-manipulation
              ${activeTab === 'game' 
                ? 'bg-gradient-to-br from-[#6BCB77] to-[#5BB967] text-white shadow-lg scale-105' 
                : 'bg-white text-gray-600 active:scale-95 sm:hover:scale-105'
              }
            `}
          >
            Game Type
          </button>
        </div>

        {activeTab === 'game' && (
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'tug-of-war', 'water-balloon', 'cargo-push'].map((type) => (
              <button
                key={type}
                onClick={() => setGameType(type)}
                className={`
                  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all touch-manipulation
                  ${gameType === type
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-600 active:bg-gray-100 sm:hover:bg-gray-100'
                  }
                `}
              >
                {type === 'all' ? 'All' : type.replace('-', ' ')}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="text-xl text-gray-600">Ачааллаж байна...</div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {!loading && !error && leaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            Leaderboard хоосон байна
          </div>
        )}

        {!loading && leaderboard.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            {leaderboard.map((entry) => {
              const isCurrentPlayer = entry.playerId === currentPlayerId;
              return (
                <div
                  key={entry.playerId}
                  className={`
                    bg-gradient-to-br ${getCardGradient(entry.rank)}
                    rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg
                    transform transition-all duration-300 active:scale-95 sm:hover:scale-105
                    flex items-center gap-2 sm:gap-3 md:gap-4
                    ${isCurrentPlayer ? 'ring-2 sm:ring-4 ring-blue-500' : ''}
                  `}
                  style={{
                    border: entry.rank <= 3 ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <div className="flex items-center justify-center w-8 sm:w-10 md:w-12 flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{
                      background: entry.avatar || '#4D96FF',
                      border: '2px solid white',
                    }}
                  >
                    <span className="text-white text-sm sm:text-base md:text-xl font-bold">
                      {entry.username.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`${entry.rank <= 3 ? 'text-white' : 'text-gray-800'} font-semibold text-sm sm:text-base truncate`}>
                      {entry.username}
                      {isCurrentPlayer && (
                        <span className="ml-1 sm:ml-2 text-xs bg-blue-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="text-lg sm:text-xl md:text-2xl font-bold flex-shrink-0"
                    style={{
                      color: entry.rank <= 3 ? 'white' : '#4D96FF',
                    }}
                  >
                    {entry.points.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <PlayfulButton onClick={onClose} variant="danger">
            Close
          </PlayfulButton>
        </div>
      </div>
    </div>
  );
}
