import React, { useState, useEffect } from 'react';
import { PlayfulButton } from './PlayfulButton';
import { PlayerCard } from './PlayerCard';
import { TopBar } from './TopBar';
import { CountdownNumber } from './CountdownNumber';
import { DiceButton } from './DiceButton';

interface Player {
  name: string;
  score: number;
  avatarColor: string;
  balloonSize: number; // 0-100
  burst: boolean;
}

interface WaterBalloonProps {
  players: Player[];
  onGameEnd: (players: Player[]) => void;
  onHome: () => void;
  onLeaderboard: () => void;
}

export function WaterBalloon({ players, onGameEnd, onHome, onLeaderboard }: WaterBalloonProps) {
  const [countdown, setCountdown] = useState<number | 'GO!' | null>(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [balloonSize, setBalloonSize] = useState(20);
  const [burst, setBurst] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [roundsLeft, setRoundsLeft] = useState(10);

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

  const handleRoll = (result: number) => {
    if (burst) return;

    const newSize = balloonSize + result * 5;
    setBalloonSize(newSize);

    if (newSize >= 100) {
      setBurst(true);
      setTimeout(() => endGame(), 2000);
    } else {
      setRoundsLeft((prev) => {
        if (prev <= 1) {
          setTimeout(() => endGame(), 1000);
          return 0;
        }
        return prev - 1;
      });
      setCurrentTurn((prev) => (prev + 1) % players.length);
    }
  };

  const endGame = () => {
    setGameStarted(false);
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      score: index === 0 ? (burst ? 0 : balloonSize * 10) : Math.floor(Math.random() * 1000),
      burst: index === 0 ? burst : Math.random() > 0.5,
    }));
    onGameEnd(updatedPlayers);
  };

  const otherPlayers = players.slice(1);
  const balloonColor = burst ? '#FF6B6B' : balloonSize > 80 ? '#FFD93D' : '#4D96FF';

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        title="💧 Water Balloon"
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
          {/* Rounds left */}
          <div className="text-center">
            <div className="text-2xl text-gray-600 mb-2">Rounds Left</div>
            <div
              className="text-5xl"
              style={{
                background: 'linear-gradient(135deg, #6BCB77 0%, #4D96FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {roundsLeft}
            </div>
          </div>

          {/* Balloon */}
          <div className="relative flex items-center justify-center" style={{ minHeight: '300px' }}>
            {burst ? (
              <div className="text-center animate-pop">
                <div className="text-9xl mb-4">💥</div>
                <div className="text-4xl text-[#FF6B6B]">BURST!</div>
              </div>
            ) : (
              <div
                className="rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center"
                style={{
                  width: `${100 + balloonSize * 2}px`,
                  height: `${120 + balloonSize * 2.4}px`,
                  background: `radial-gradient(circle at 30% 30%, ${balloonColor}ee, ${balloonColor})`,
                  border: '6px solid rgba(255, 255, 255, 0.5)',
                  animation: balloonSize > 80 ? 'pulse 0.5s ease-in-out infinite' : 'none',
                }}
              >
                <div className="text-6xl">💧</div>
              </div>
            )}

            {/* Size indicator */}
            {!burst && (
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-64">
                <div className="text-center text-gray-600 mb-2 text-sm">Fill Level</div>
                <div className="w-full bg-white rounded-full h-8 shadow-inner overflow-hidden" style={{ border: '3px solid rgba(0, 0, 0, 0.1)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${balloonSize}%`,
                      background: `linear-gradient(90deg, ${balloonColor} 0%, ${balloonColor}dd 100%)`,
                    }}
                  />
                </div>
                <div className="text-center mt-2 text-2xl" style={{ color: balloonColor }}>
                  {balloonSize}%
                </div>
              </div>
            )}
          </div>

          {/* Warning */}
          {balloonSize > 80 && !burst && (
            <div className="text-center animate-bounce">
              <div className="text-3xl text-[#FF6B6B]">⚠️ Danger Zone! ⚠️</div>
            </div>
          )}
        </div>

        {/* My player card and controls */}
        <div className="mt-6 space-y-4">
          <PlayerCard
            name={players[0].name}
            score={players[0].score}
            avatarColor={players[0].avatarColor}
            status={gameStarted && currentTurn === 0 && !burst ? 'active' : 'waiting'}
            isMe
            size="large"
          />

          <div className="flex justify-center">
            <DiceButton
              onRoll={handleRoll}
              disabled={!gameStarted || currentTurn !== 0 || burst}
              isActive={gameStarted && currentTurn === 0 && !burst}
            />
          </div>

          {currentTurn === 0 && gameStarted && !burst && (
            <div className="text-center text-xl text-gray-700">
              🎲 Your Turn! Roll the dice!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
