import React from 'react';
import { PlayfulButton } from './PlayfulButton';
import { Trophy, Medal, Award } from 'lucide-react';

interface Player {
  name: string;
  score: number;
  avatarColor: string;
}

interface ResultScreenProps {
  players: Player[];
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function ResultScreen({ players, onPlayAgain, onMainMenu }: ResultScreenProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="text-[#FFD93D] animate-bounce" size={64} />;
    if (rank === 1) return <Medal className="text-gray-400" size={48} />;
    if (rank === 2) return <Award className="text-[#CD7F32]" size={48} />;
    return null;
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return '🎮';
  };

  const getCardScale = (rank: number) => {
    if (rank === 0) return 'scale-110';
    if (rank === 1) return 'scale-105';
    return 'scale-100';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12 animate-pop">
        <h1
          className="text-7xl mb-4"
          style={{
            background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🎉 Game Over! 🎉
        </h1>
        <p className="text-2xl text-gray-700">Final Results</p>
      </div>

      <div className="space-y-6 w-full max-w-2xl mb-12">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.name}
            className={`
              bg-white
              rounded-[2rem]
              p-6
              shadow-2xl
              transform
              transition-all
              duration-500
              hover:scale-105
              ${getCardScale(index)}
            `}
            style={{
              border: index === 0 ? '6px solid #FFD93D' : '4px solid rgba(255, 255, 255, 0.5)',
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                {getRankIcon(index)}
                <div className="text-4xl mt-2">{getRankEmoji(index)}</div>
              </div>

              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background: player.avatarColor,
                  border: '4px solid white',
                }}
              >
                <span className="text-white text-3xl">{player.name.charAt(0)}</span>
              </div>

              <div className="flex-1">
                <h3 className="text-gray-800 mb-1">{player.name}</h3>
                <div className="text-sm text-gray-600">
                  {index === 0 ? 'Winner!' : `Place #${index + 1}`}
                </div>
              </div>

              <div
                className="text-5xl"
                style={{
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {player.score}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <PlayfulButton onClick={onPlayAgain} variant="secondary" size="large">
          🔄 Play Again
        </PlayfulButton>
        <PlayfulButton onClick={onMainMenu} variant="primary" size="large">
          🏠 Main Menu
        </PlayfulButton>
      </div>
    </div>
  );
}
