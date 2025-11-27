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
  position: number; // -50 to 50
}

interface TugOfWarProps {
  players: Player[];
  onGameEnd: (players: Player[]) => void;
  onHome: () => void;
  onLeaderboard: () => void;
}

export function TugOfWar({ players, onGameEnd, onHome, onLeaderboard }: TugOfWarProps) {
  const [countdown, setCountdown] = useState<number | 'GO!' | null>(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [ropePosition, setRopePosition] = useState(0); // -50 to 50
  const [timeLeft, setTimeLeft] = useState(30);

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

  // Simulate opponent clicks
  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      const opponentPull = Math.random() * 0.5;
      setRopePosition((prev) => Math.max(-50, Math.min(50, prev - opponentPull)));
    }, 500);

    return () => clearInterval(interval);
  }, [gameStarted]);

  const handleClick = () => {
    if (!gameStarted) return;

    setClickCount((prev) => prev + 1);
    setRopePosition((prev) => {
      const newPos = Math.max(-50, Math.min(50, prev + 1));
      if (newPos >= 50) {
        endGame();
      }
      return newPos;
    });
  };

  const endGame = () => {
    setGameStarted(false);
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      score: index === 0 ? clickCount * 10 + (ropePosition > 0 ? 500 : 0) : Math.floor(Math.random() * 800),
    }));
    setTimeout(() => onGameEnd(updatedPlayers), 1000);
  };

  const otherPlayers = players.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        title="⚔️ Tug of War"
        matchId="12345"
        onHomeClick={onHome}
        onLeaderboardClick={onLeaderboard}
      />

      {countdown !== null && <CountdownNumber number={countdown} />}

      <div className="flex-1 flex flex-col p-6">
        {/* Other players */}
        <div className={`mb-6 ${otherPlayers.length === 3 ? 'grid grid-cols-3 gap-4' : otherPlayers.length === 2 ? 'grid grid-cols-2 gap-4' : ''}`}>
          {otherPlayers.map((player) => (
            <PlayerCard
              key={player.name}
              name={player.name}
              score={player.score}
              avatarColor={player.avatarColor}
              status="waiting"
              size="small"
            />
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

          {/* Rope visualization */}
          <div className="w-full max-w-3xl">
            <div className="relative bg-white rounded-full h-32 shadow-inner overflow-hidden" style={{ border: '4px solid rgba(0, 0, 0, 0.1)' }}>
              {/* Left zone */}
              <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-[#FF6B6B] to-transparent opacity-30" />
              {/* Right zone */}
              <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-[#6BCB77] to-transparent opacity-30" />
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-400 transform -translate-x-1/2" />
              
              {/* Rope marker */}
              <div
                className="absolute top-1/2 w-16 h-16 transform -translate-y-1/2 transition-all duration-200"
                style={{
                  left: `calc(50% + ${ropePosition}% - 2rem)`,
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-[#FFD93D] to-[#FF6B6B] rounded-full shadow-2xl flex items-center justify-center animate-pulse">
                  <span className="text-2xl">🪢</span>
                </div>
              </div>
            </div>

            {/* Position indicator */}
            <div className="mt-4 text-center text-gray-600">
              Position: {ropePosition > 0 ? '+' : ''}{ropePosition.toFixed(1)}
            </div>
          </div>

          {/* Click count */}
          <div className="text-center">
            <div className="text-xl text-gray-600 mb-2">Clicks</div>
            <div
              className="text-6xl"
              style={{
                background: 'linear-gradient(135deg, #4D96FF 0%, #6BCB77 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {clickCount}
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
            onClick={handleClick}
            variant="danger"
            size="large"
            disabled={!gameStarted}
            className="w-full"
          >
            💪 PULL! 💪
          </PlayfulButton>
        </div>
      </div>
    </div>
  );
}
