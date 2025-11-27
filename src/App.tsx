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
import { gameService } from './api/services/game';
import { playerService } from './api/services/player';
import { useWebSocket } from './hooks/useWebSocket';
import { wsClient } from './websocket/client';
import { Matchmaking } from './components/Matchmaking';
import type { GameSession, GameResult } from './types/api';

type Screen = 'menu' | 'leaderboard' | 'rope' | 'balloon' | 'cargo' | 'result' | 'auth' | 'matchmaking';
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
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [matchSessionId, setMatchSessionId] = useState<string | null>(null);

  const token = authService.getToken();
  const wsClientHook = useWebSocket(token);

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

    // Direct game start (local play)
    setCurrentGame(game);
    setCurrentScreen(game);
    setPlayers(initialPlayers);
  };

  const handleStartMatchmaking = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setCurrentScreen('matchmaking');
  };

  const handleMatchFound = async (sessionId: string, opponentId: string) => {
    setMatchSessionId(sessionId);
    try {
      const response = await gameService.getSession(sessionId);
      if (response.success && response.data) {
        setGameSession(response.data);
        // Determine game type from session
        const gameTypeMap: Record<string, GameType> = {
          'tug-of-war': 'rope',
          'water-balloon': 'balloon',
          'cargo-push': 'cargo',
        };
        const gameType = gameTypeMap[response.data.gameType] || 'rope';
        setCurrentGame(gameType);
        setCurrentScreen(gameType);
        setPlayers(initialPlayers);
      }
    } catch (error) {
      console.error('Failed to load game session:', error);
    }
  };

  const handleGameEnd = async (updatedPlayers: Player[], gameResult?: any) => {
    setPlayers(updatedPlayers);
    setLastGameResult(gameResult); // Store result for ResultScreen
    setCurrentScreen('result');

    // Note: Result submission is now handled in game components (CargoPush, etc.)
    // This allows each game to submit its own result format
  };

  const handlePlayAgain = () => {
    if (currentGame) {
      setPlayers(initialPlayers);
      setCurrentScreen(currentGame);
    }
  };

  const handleMainMenu = () => {
    // Leave game session via WebSocket
    if (gameSession) {
      const playerId = authService.getPlayerId();
      if (playerId) {
        wsClient.leaveGame(gameSession._id, playerId);
      }
    }
    setCurrentScreen('menu');
    setCurrentGame(null);
    setGameSession(null);
    setMatchSessionId(null);
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
    wsClient.disconnect();
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
          <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-40 flex flex-col sm:flex-row gap-2">
            {playerProfile && (
              <div className="bg-white rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 shadow-lg flex items-center gap-1 sm:gap-2">
                <div
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold"
                  style={{ background: '#4D96FF' }}
                >
                  {playerProfile.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">{playerProfile.username}</span>
                <span className="text-xs text-gray-500 hidden sm:inline">Lv.{playerProfile.level || 1}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl active:bg-red-600 sm:hover:bg-red-600 transition-colors text-xs sm:text-sm touch-manipulation"
            >
              Гарах
            </button>
          </div>
        )}

        {currentScreen === 'menu' && (
          <MainMenu
            onSelectGame={handleSelectGame}
            onShowLeaderboard={handleShowLeaderboard}
            onStartMatchmaking={handleStartMatchmaking}
          />
        )}

        {currentScreen === 'leaderboard' && (
          <Leaderboard onClose={handleCloseLeaderboard} />
        )}

        {currentScreen === 'matchmaking' && (
          <Matchmaking
            onMatchFound={handleMatchFound}
            onCancel={() => setCurrentScreen('menu')}
          />
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
            sessionId={matchSessionId || gameSession?._id || undefined}
            gameSession={gameSession}
          />
        )}

        {currentScreen === 'result' && (
          <ResultScreen
            players={players}
            onPlayAgain={handlePlayAgain}
            onMainMenu={handleMainMenu}
            gameResult={lastGameResult}
            sessionId={matchSessionId || gameSession?._id || undefined}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
