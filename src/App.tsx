import React, { useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { Leaderboard } from './components/Leaderboard';
import { TugOfWar } from './components/TugOfWar';
import { WaterBalloon } from './components/WaterBalloon';
import { CargoPush } from './components/CargoPush';
import { ResultScreen } from './components/ResultScreen';

type Screen = 'menu' | 'leaderboard' | 'rope' | 'balloon' | 'cargo' | 'result';
type GameType = 'rope' | 'balloon' | 'cargo';

interface Player {
  name: string;
  score: number;
  avatarColor: string;
}

const initialPlayers: Player[] = [
  { name: 'You', score: 0, avatarColor: '#4D96FF' },
  { name: 'Player2', score: 0, avatarColor: '#FF6B6B' },
  { name: 'Player3', score: 0, avatarColor: '#FFD93D' },
  { name: 'Player4', score: 0, avatarColor: '#6BCB77' },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  const handleSelectGame = (game: GameType) => {
    setCurrentGame(game);
    setCurrentScreen(game);
    setPlayers(initialPlayers);
  };

  const handleGameEnd = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    setCurrentScreen('result');
  };

  const handlePlayAgain = () => {
    if (currentGame) {
      setPlayers(initialPlayers);
      setCurrentScreen(currentGame);
    }
  };

  const handleMainMenu = () => {
    setCurrentScreen('menu');
    setCurrentGame(null);
    setPlayers(initialPlayers);
  };

  const handleShowLeaderboard = () => {
    setCurrentScreen('leaderboard');
  };

  const handleCloseLeaderboard = () => {
    setCurrentScreen('menu');
  };

  return (
    <div className="min-h-screen">
      {currentScreen === 'menu' && (
        <MainMenu
          onSelectGame={handleSelectGame}
          onShowLeaderboard={handleShowLeaderboard}
        />
      )}

      {currentScreen === 'leaderboard' && (
        <Leaderboard onClose={handleCloseLeaderboard} />
      )}

      {currentScreen === 'rope' && (
        <TugOfWar
          players={players}
          onGameEnd={handleGameEnd}
          onHome={handleMainMenu}
          onLeaderboard={handleShowLeaderboard}
        />
      )}

      {currentScreen === 'balloon' && (
        <WaterBalloon
          players={players}
          onGameEnd={handleGameEnd}
          onHome={handleMainMenu}
          onLeaderboard={handleShowLeaderboard}
        />
      )}

      {currentScreen === 'cargo' && (
        <CargoPush
          players={players}
          onGameEnd={handleGameEnd}
          onHome={handleMainMenu}
          onLeaderboard={handleShowLeaderboard}
        />
      )}

      {currentScreen === 'result' && (
        <ResultScreen
          players={players}
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleMainMenu}
        />
      )}
    </div>
  );
}
