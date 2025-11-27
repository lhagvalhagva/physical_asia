import React, { useState, useEffect } from 'react';
import { PlayfulButton } from './PlayfulButton';
import { PlayerCard } from './PlayerCard';
import { TopBar } from './TopBar';
import { CountdownNumber } from './CountdownNumber';
import { ProgressBar } from './ProgressBar';

interface Player {
  name: string;
  score: number;
  avatarColor: string;
  progress: number; // 0-100
}

interface CargoPushProps {
  players: Player[];
  onGameEnd: (players: Player[]) => void;
  onHome: () => void;
  onLeaderboard: () => void;
}

export function CargoPush({ players, onGameEnd, onHome, onLeaderboard }: CargoPushProps) {
  const [countdown, setCountdown] = useState<number | 'GO!' | null>(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pushCount, setPushCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [opponentProgress, setOpponentProgress] = useState<number[]>([0, 0, 0]);

  // Countdown logic
  useEffect(() => {
    if (countdown === null) return;

    if (typeof countdown === 'number' && countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          setCountdown('GO!');
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 'GO!') {
      const timer = setTimeout(() => {
        setCountdown(null);
        setGameStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Game timer
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  // Simulate opponent progress
  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      setOpponentProgress((prev) =>
        prev.map((p) => {
          const newProgress = Math.min(100, p + Math.random() * 2);
          if (newProgress >= 100) {
            endGame();
          }
          return newProgress;
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, [gameStarted]);

  // Check win condition
  useEffect(() => {
    if (progress >= 100) {
      endGame();
    }
  }, [progress]);

  const handlePush = () => {
    if (!gameStarted) return;

    setPushCount((prev) => prev + 1);
    setProgress((prev) => Math.min(100, prev + 2));
  };

  const endGame = () => {
    setGameStarted(false);
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      score: index === 0 ? pushCount * 10 + (progress >= 100 ? 500 : 0) : Math.floor(Math.random() * 800),
      progress: index === 0 ? progress : opponentProgress[index - 1] || 0,
    }));
    setTimeout(() => onGameEnd(updatedPlayers), 1000);
  };

  const otherPlayers = players.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        title="📦 Cargo Push"
        matchId="12345"
        onHomeClick={onHome}
        onLeaderboardClick={onLeaderboard}
      />

      {countdown !== null && <CountdownNumber number={countdown} />}

      <div className="flex-1 flex flex-col p-6">
        {/* Other players */}
        <div className={`mb-6 ${otherPlayers.length === 3 ? 'grid grid-cols-3 gap-4' : otherPlayers.length === 2 ? 'grid grid-cols-2 gap-4' : ''}`}>
          {otherPlayers.map((player, index) => (
            <div key={player.name}>
              <PlayerCard
                name={player.name}
                score={player.score}
                avatarColor={player.avatarColor}
                status="waiting"
                size="small"
              />
              <div className="mt-2">
                <ProgressBar progress={opponentProgress[index]} color={player.avatarColor} height={16} />
              </div>
            </div>
          ))}
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          {/* Timer */}
          <div className="text-center">
            <div className="text-6xl mb-2">⏱️</div>
            <div
              className="text-5xl"
              style={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {timeLeft}s
            </div>
          </div>

          {/* Track visualization */}
          <div className="w-full max-w-3xl">
            <div className="relative bg-white rounded-3xl p-8 shadow-inner" style={{ border: '4px solid rgba(0, 0, 0, 0.1)' }}>
              {/* Start line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-[#6BCB77]" />
              {/* Finish line */}
              <div className="absolute right-8 top-0 bottom-0 w-1 bg-[#FF6B6B]" />
              
              {/* Track */}
              <div className="relative h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl overflow-hidden">
                {/* Cargo box */}
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-300"
                  style={{
                    left: `calc(${progress}% - 2rem)`,
                  }}
                >
                  <div className="relative">
                    <div
                      className="w-16 h-16 bg-gradient-to-br from-[#6BCB77] to-[#5BB967] rounded-xl shadow-2xl flex items-center justify-center"
                      style={{
                        border: '4px solid white',
                        transform: gameStarted ? 'rotate(2deg)' : 'none',
                      }}
                    >
                      <span className="text-3xl">📦</span>
                    </div>
                    
                    {/* Motion streaks when moving */}
                    {gameStarted && progress < 100 && (
                      <div className="absolute left-0 top-0 w-full h-full opacity-50">
                        <div className="absolute left-0 top-1/2 w-8 h-1 bg-[#6BCB77] transform -translate-x-full" />
                        <div className="absolute left-0 top-1/2 w-6 h-1 bg-[#6BCB77] transform -translate-x-full translate-y-2" />
                        <div className="absolute left-0 top-1/2 w-6 h-1 bg-[#6BCB77] transform -translate-x-full -translate-y-2" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Finish flag */}
                {progress >= 95 && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-5xl animate-bounce">
                    🏁
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <ProgressBar progress={progress} color="#6BCB77" height={20} />
              </div>

              {/* Progress percentage */}
              <div className="text-center mt-2 text-3xl" style={{ color: '#6BCB77' }}>
                {progress.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Push count */}
          <div className="text-center">
            <div className="text-xl text-gray-600 mb-2">Pushes</div>
            <div
              className="text-6xl"
              style={{
                background: 'linear-gradient(135deg, #4D96FF 0%, #6BCB77 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {pushCount}
            </div>
          </div>
        </div>

        {/* My player card and controls */}
        <div className="mt-6 space-y-4">
          <PlayerCard
            name={players[0].name}
            score={players[0].score}
            avatarColor={players[0].avatarColor}
            status={gameStarted ? 'active' : 'waiting'}
            isMe
            size="large"
          />

          <PlayfulButton
            onClick={handlePush}
            variant="secondary"
            size="large"
            disabled={!gameStarted}
            className="w-full"
          >
            💪 PUSH! 💪
          </PlayfulButton>
        </div>
      </div>
    </div>
  );
}
