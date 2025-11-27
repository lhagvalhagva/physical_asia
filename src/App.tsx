import React, { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { Leaderboard } from './components/Leaderboard';
import { TugOfWar } from './components/TugOfWar';
import { WaterBalloon } from './components/WaterBalloon';
import { CargoPush } from './components/CargoPush';
import { ResultScreen } from './components/ResultScreen';
import { AuthModal } from './components/AuthModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { authService } from './api/services/auth';
// import { gameService } from './api/services/game';
import { playerService } from './api/services/player';
// import { useWebSocket } from './hooks/useWebSocket';
// import type { GameSession, GameResult } from './types/api';

type Screen = 'menu' | 'leaderboard' | 'rope' | 'balloon' | 'cargo' | 'result' | 'auth';
type GameType = 'rope' | 'balloon' | 'cargo';

interface Player {
  name: string;
  score: number;
  avatarColor: string;
  id?: string;
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
  // const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [playerProfile, setPlayerProfile] = useState<any>(null);

  const token = authService.getToken();
  // const wsClient = useWebSocket(token);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (!authenticated) {
        setShowAuth(true);
      } else {
        loadPlayerProfile();
      }
    };
    checkAuth();
  }, []);

  const loadPlayerProfile = async () => {
    const playerId = authService.getPlayerId();
    if (playerId) {
      try {
        const response = await playerService.getProfile(playerId);
        if (response.success && response.data) {
          setPlayerProfile(response.data);
          setPlayers(prev => prev.map((p, i) => 
            i === 0 ? { ...p, name: response.data.username, id: response.data.id } : p
          ));
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
    loadPlayerProfile();
  };

  const handleSelectGame = async (game: GameType) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    // Session creation commented out
    // try {
    //   const gameTypeMap: Record<GameType, string> = {
    //     rope: 'tug-of-war',
    //     balloon: 'water-balloon',
    //     cargo: 'cargo-push',
    //   };

    //   const response = await gameService.createSession(gameTypeMap[game], '1v1');
    //   if (response.success && response.data) {
    //     setGameSession(response.data);
    //     setCurrentGame(game);
    //     setCurrentScreen(game);
    //     setPlayers(initialPlayers);

    //     // Join game via WebSocket
    //     const playerId = authService.getPlayerId();
    //     if (playerId && response.data._id) {
    //       wsClient.joinGame(response.data._id, playerId);
    //     }
    //   }
    // } catch (error: any) {
    //   console.error('Failed to create game session:', error);
    //   alert('Тоглоом эхлүүлэхэд алдаа гарлаа: ' + error.message);
    // }

    // Direct game start without session
    setCurrentGame(game);
    setCurrentScreen(game);
    setPlayers(initialPlayers);
  };

  const handleGameEnd = async (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    setCurrentScreen('result');

    // Game result submission commented out
    // if (gameSession && isAuthenticated) {
    //   try {
    //     const playerId = authService.getPlayerId();
    //     const winner = updatedPlayers.sort((a, b) => b.score - a.score)[0];
    //     const playerRank = updatedPlayers
    //       .sort((a, b) => b.score - a.score)
    //       .findIndex(p => p.id === playerId || p.name === 'You') + 1;

    //     await gameService.submitResult(
    //       gameSession._id,
    //       winner.score,
    //       {
    //         players: updatedPlayers.map(p => ({ name: p.name, score: p.score })),
    //         gameType: currentGame,
    //       },
    //       playerRank
    //     );
    //   } catch (error) {
    //     console.error('Failed to submit game result:', error);
    //   }
    // }
  };

  const handlePlayAgain = () => {
    if (currentGame) {
      setPlayers(initialPlayers);
      setCurrentScreen(currentGame);
    }
  };

  const handleMainMenu = () => {
    // WebSocket leave game commented out
    // if (gameSession) {
    //   const playerId = authService.getPlayerId();
    //   if (playerId) {
    //     wsClient.leaveGame(gameSession._id, playerId);
    //   }
    // }
    setCurrentScreen('menu');
    setCurrentGame(null);
    // setGameSession(null);
    setPlayers(initialPlayers);
  };

  const handleShowLeaderboard = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setCurrentScreen('leaderboard');
  };

  const handleCloseLeaderboard = () => {
    setCurrentScreen('menu');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setShowAuth(true);
    // wsClient.disconnect();
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {showAuth && !isAuthenticated && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={handleAuthSuccess}
          />
        )}

        {isAuthenticated && (
          <div className="fixed top-4 right-4 z-40 flex gap-2">
            {playerProfile && (
              <div className="bg-white rounded-xl px-4 py-2 shadow-lg flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: '#4D96FF' }}
                >
                  {playerProfile.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{playerProfile.username}</span>
                <span className="text-xs text-gray-500">Lv.{playerProfile.level || 1}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors text-sm"
            >
              Гарах
            </button>
          </div>
        )}

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
    </ErrorBoundary>
  );
}
