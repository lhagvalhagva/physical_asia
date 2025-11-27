import { useState, useEffect } from 'react';
import { wsClient } from '../websocket/client';

interface MatchmakingState {
  isSearching: boolean;
  queuePosition: number | null;
  matchFound: boolean;
  sessionId: string | null;
  opponentId: string | null;
  error: string | null;
}

export function useMatchmaking() {
  const [state, setState] = useState<MatchmakingState>({
    isSearching: false,
    queuePosition: null,
    matchFound: false,
    sessionId: null,
    opponentId: null,
    error: null
  });

  const socket = wsClient.getSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for queue position updates
    const handleQueued = (data: { position: number }) => {
      setState(prev => ({
        ...prev,
        queuePosition: data.position,
        isSearching: true
      }));
    };

    // Listen for match found
    const handleFound = (data: { sessionId: string; opponent: string }) => {
      setState(prev => ({
        ...prev,
        matchFound: true,
        sessionId: data.sessionId,
        opponentId: data.opponent,
        isSearching: false,
        queuePosition: null
      }));
    };

    socket.on('matchmaking:queued', handleQueued);
    socket.on('matchmaking:found', handleFound);

    // Cleanup
    return () => {
      socket.off('matchmaking:queued', handleQueued);
      socket.off('matchmaking:found', handleFound);
    };
  }, [socket]);

  // Join matchmaking queue
  const joinQueue = (gameType: string, mode: string = 'ranked') => {
    if (!wsClient.isConnected()) {
      setState(prev => ({ ...prev, error: 'WebSocket not connected' }));
      return;
    }

    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
      setState(prev => ({ ...prev, error: 'Player not logged in' }));
      return;
    }

    setState(prev => ({
      ...prev,
      isSearching: true,
      queuePosition: null,
      matchFound: false,
      error: null
    }));

    wsClient.joinMatchmaking(playerId, gameType, mode);
  };

  // Leave matchmaking queue
  const leaveQueue = (gameType: string, mode: string = 'ranked') => {
    if (!wsClient.isConnected()) return;

    wsClient.leaveMatchmaking(gameType, mode);

    setState({
      isSearching: false,
      queuePosition: null,
      matchFound: false,
      sessionId: null,
      opponentId: null,
      error: null
    });
  };

  // Reset state after match
  const resetMatch = () => {
    setState({
      isSearching: false,
      queuePosition: null,
      matchFound: false,
      sessionId: null,
      opponentId: null,
      error: null
    });
  };

  return {
    ...state,
    joinQueue,
    leaveQueue,
    resetMatch
  };
}

