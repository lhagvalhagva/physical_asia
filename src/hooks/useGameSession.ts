import { useState, useEffect } from 'react';
import { wsClient } from '../websocket/client';
import { gameService } from '../api/services/game';
import type { GameSession } from '../types/api';

interface GameState {
  sessionId: string | null;
  players: Array<{ playerId: string; username: string; avatar: string }>;
  gameState: any;
  isReady: boolean;
  gameStarted: boolean;
  gameFinished: boolean;
}

export function useGameSession(sessionId: string | null) {
  const [gameState, setGameState] = useState<GameState>({
    sessionId: null,
    players: [],
    gameState: null,
    isReady: false,
    gameStarted: false,
    gameFinished: false
  });

  const socket = wsClient.getSocket();
  const playerId = localStorage.getItem('playerId');

  useEffect(() => {
    if (!socket || !sessionId) return;

    // Join game session
    wsClient.joinGame(sessionId, playerId || '');

    // Listen for player joined
    const handlePlayerJoined = (data: { playerId: string; socketId: string }) => {
      console.log('Player joined:', data);
      fetchSessionDetails();
    };

    // Listen for game state updates
    const handleGameState = (data: { playerId: string; state: any; timestamp: number }) => {
      setGameState(prev => ({
        ...prev,
        gameState: data.state
      }));
    };

    // Listen for game finished
    const handleGameFinished = (data: { sessionId: string; results: any }) => {
      setGameState(prev => ({
        ...prev,
        gameFinished: true
      }));
    };

    socket.on('player:joined', handlePlayerJoined);
    socket.on('game:state', handleGameState);
    socket.on('game:finished', handleGameFinished);

    // Fetch initial session details
    fetchSessionDetails();

    // Cleanup
    return () => {
      if (sessionId && playerId) {
        wsClient.leaveGame(sessionId, playerId);
      }
      socket.off('player:joined', handlePlayerJoined);
      socket.off('game:state', handleGameState);
      socket.off('game:finished', handleGameFinished);
    };
  }, [socket, sessionId, playerId]);

  // Fetch session details from API
  const fetchSessionDetails = async () => {
    if (!sessionId) return;

    try {
      const response = await gameService.getSession(sessionId);
      if (response.success && response.data) {
        setGameState(prev => ({
          ...prev,
          sessionId: response.data._id,
          players: response.data.players,
          isReady: true
        }));
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  // Send game update
  const sendGameUpdate = (state: any) => {
    if (!socket || !sessionId || !playerId) return;

    wsClient.updateGameState(sessionId, playerId, state);
  };

  // Start game
  const startGame = () => {
    setGameState(prev => ({ ...prev, gameStarted: true }));
  };

  return {
    ...gameState,
    sendGameUpdate,
    startGame
  };
}

