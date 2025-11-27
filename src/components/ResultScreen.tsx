import React, { useEffect, useState } from 'react';
import { PlayfulButton } from './PlayfulButton';
import { Trophy, Medal, Award } from 'lucide-react';
import type { GameResult } from '../types/api';

interface Player {
  name: string;
  score: number;
  avatarColor: string;
  id?: string;
}

interface ResultScreenProps {
  players: Player[];
  onPlayAgain: () => void;
  onMainMenu: () => void;
  gameResult?: GameResult | null; // Game result from backend
  sessionId?: string; // Session ID to fetch results
}

export function ResultScreen({ players, onPlayAgain, onMainMenu, gameResult, sessionId }: ResultScreenProps) {
  const [gameResults, setGameResults] = useState<GameResult | null>(gameResult || null);
  const [loading, setLoading] = useState(false);

  // Fetch game results if sessionId provided but no result
  useEffect(() => {
    if (sessionId && !gameResults) {
      fetchGameResults();
    }
  }, [sessionId]);

  const fetchGameResults = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/game/session/${sessionId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setGameResults(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch game results:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  // Get player's result from backend
  const playerId = localStorage.getItem('playerId');
  const playerResult = gameResults && playerId 
    ? (Array.isArray(gameResults) 
        ? gameResults.find((r: any) => r.playerId === playerId)
        : gameResults)
    : null;

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="text-center mb-6 sm:mb-8 md:mb-12 animate-pop">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-2 sm:mb-3 md:mb-4"
          style={{
            background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B6B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🎉 Тоглоом дууслаа! 🎉
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700">Эцсийн үр дүн</p>
        
        {/* Show rewards if available */}
        {playerResult && (
          <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
            {playerResult.xpEarned > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-4 sm:px-6 py-2 sm:py-3">
                <div className="text-xs sm:text-sm text-blue-600 font-semibold">XP</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700">+{playerResult.xpEarned}</div>
              </div>
            )}
            {playerResult.rewards?.coins > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl px-4 sm:px-6 py-2 sm:py-3">
                <div className="text-xs sm:text-sm text-yellow-600 font-semibold">💰 Зоос</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-700">+{playerResult.rewards.coins}</div>
              </div>
            )}
            {playerResult.pointsEarned > 0 && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl px-4 sm:px-6 py-2 sm:py-3">
                <div className="text-xs sm:text-sm text-purple-600 font-semibold">Оноо</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-700">+{playerResult.pointsEarned}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full max-w-2xl mb-6 sm:mb-8 md:mb-12 px-4">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.name}
            className={`
              bg-white
              rounded-xl sm:rounded-2xl
              p-4 sm:p-5 md:p-6
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
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="flex flex-col items-center flex-shrink-0">
                {getRankIcon(index)}
                <div className="text-2xl sm:text-3xl md:text-4xl mt-1 sm:mt-2">{getRankEmoji(index)}</div>
              </div>

              <div
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                style={{
                  background: player.avatarColor,
                  border: '3px solid white',
                }}
              >
                <span className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl">{player.name.charAt(0)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-gray-800 mb-1 text-sm sm:text-base md:text-lg truncate">{player.name}</h3>
                <div className="text-xs sm:text-sm text-gray-600">
                  {index === 0 ? 'Ялагч!' : `${index + 1}-р байр`}
                </div>
              </div>

              <div
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold flex-shrink-0"
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

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md px-4">
        <PlayfulButton onClick={onPlayAgain} variant="secondary" size="large" className="w-full sm:w-auto">
          🔄 Дахин тоглох
        </PlayfulButton>
        <PlayfulButton onClick={onMainMenu} variant="primary" size="large" className="w-full sm:w-auto">
          🏠 Үндсэн цэс
        </PlayfulButton>
      </div>
    </div>
  );
}
