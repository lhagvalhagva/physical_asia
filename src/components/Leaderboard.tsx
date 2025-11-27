import React, { useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { PlayfulButton } from './PlayfulButton';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatarColor: string;
}

interface LeaderboardProps {
  onClose: () => void;
}

const mockData = {
  daily: [
    { rank: 1, name: 'ProGamer99', score: 2850, avatarColor: '#FF6B6B' },
    { rank: 2, name: 'ClickMaster', score: 2640, avatarColor: '#FFD93D' },
    { rank: 3, name: 'SpeedDemon', score: 2420, avatarColor: '#6BCB77' },
    { rank: 4, name: 'TurboTapper', score: 2180, avatarColor: '#4D96FF' },
    { rank: 5, name: 'FastFingers', score: 1950, avatarColor: '#FF6B6B' },
  ],
  weekly: [
    { rank: 1, name: 'LegendPlayer', score: 18500, avatarColor: '#FFD93D' },
    { rank: 2, name: 'ChampionX', score: 17200, avatarColor: '#6BCB77' },
    { rank: 3, name: 'ProGamer99', score: 16800, avatarColor: '#FF6B6B' },
    { rank: 4, name: 'EliteClicker', score: 15400, avatarColor: '#4D96FF' },
    { rank: 5, name: 'ClickMaster', score: 14200, avatarColor: '#FFD93D' },
  ],
  alltime: [
    { rank: 1, name: 'TheGoat', score: 95000, avatarColor: '#FF6B6B' },
    { rank: 2, name: 'Unstoppable', score: 87500, avatarColor: '#FFD93D' },
    { rank: 3, name: 'LegendPlayer', score: 82000, avatarColor: '#6BCB77' },
    { rank: 4, name: 'ProKing', score: 78000, avatarColor: '#4D96FF' },
    { rank: 5, name: 'ChampionX', score: 74500, avatarColor: '#FF6B6B' },
  ],
};

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'alltime'>('daily');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-[#FFD93D]" size={32} />;
    if (rank === 2) return <Medal className="text-gray-400" size={28} />;
    if (rank === 3) return <Award className="text-[#CD7F32]" size={28} />;
    return <div className="w-8 h-8 flex items-center justify-center text-gray-600">{rank}</div>;
  };

  const getCardGradient = (rank: number) => {
    if (rank === 1) return 'from-[#FFD93D] to-[#FFC72D]';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-[#CD7F32] to-[#B87333]';
    return 'from-white to-gray-50';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#E0F7FA] to-[#B2EBF2] rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="text-center mb-6">
          <h1
            style={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 50%, #6BCB77 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🏆 Leaderboard 🏆
          </h1>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('daily')}
            className={`
              flex-1 py-3 rounded-2xl transition-all duration-300
              ${activeTab === 'daily' 
                ? 'bg-gradient-to-br from-[#4D96FF] to-[#3B7FE8] text-white shadow-lg scale-105' 
                : 'bg-white text-gray-600 hover:scale-105'
              }
            `}
          >
            Daily
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`
              flex-1 py-3 rounded-2xl transition-all duration-300
              ${activeTab === 'weekly' 
                ? 'bg-gradient-to-br from-[#6BCB77] to-[#5BB967] text-white shadow-lg scale-105' 
                : 'bg-white text-gray-600 hover:scale-105'
              }
            `}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveTab('alltime')}
            className={`
              flex-1 py-3 rounded-2xl transition-all duration-300
              ${activeTab === 'alltime' 
                ? 'bg-gradient-to-br from-[#FFD93D] to-[#FFC72D] text-white shadow-lg scale-105' 
                : 'bg-white text-gray-600 hover:scale-105'
              }
            `}
          >
            All-Time
          </button>
        </div>

        <div className="space-y-3">
          {mockData[activeTab].map((entry) => (
            <div
              key={entry.rank}
              className={`
                bg-gradient-to-br ${getCardGradient(entry.rank)}
                rounded-2xl p-4 shadow-lg
                transform transition-all duration-300 hover:scale-105
                flex items-center gap-4
              `}
              style={{
                border: entry.rank <= 3 ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.5)',
              }}
            >
              <div className="flex items-center justify-center w-12">
                {getRankIcon(entry.rank)}
              </div>
              
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background: entry.avatarColor,
                  border: '3px solid white',
                }}
              >
                <span className="text-white text-xl">{entry.name.charAt(0)}</span>
              </div>

              <div className="flex-1">
                <div className={`${entry.rank <= 3 ? 'text-white' : 'text-gray-800'}`}>
                  {entry.name}
                </div>
              </div>

              <div
                className="text-2xl"
                style={{
                  color: entry.rank <= 3 ? 'white' : '#4D96FF',
                }}
              >
                {entry.score.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <PlayfulButton onClick={onClose} variant="danger">
            Close
          </PlayfulButton>
        </div>
      </div>
    </div>
  );
}
