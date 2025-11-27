import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5001';

class WebSocketClient {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(WS_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Game Events
  joinGame(sessionId: string, playerId: string) {
    this.socket?.emit('game:join', { sessionId, playerId });
  }

  leaveGame(sessionId: string, playerId: string) {
    this.socket?.emit('game:leave', { sessionId, playerId });
  }

  updateGameState(sessionId: string, playerId: string, state: any) {
    this.socket?.emit('game:update', { sessionId, playerId, state });
  }

  onGameState(callback: (data: any) => void) {
    this.socket?.on('game:state', callback);
  }

  onGameFinished(callback: (data: any) => void) {
    this.socket?.on('game:finished', callback);
  }

  onPlayerJoined(callback: (data: any) => void) {
    this.socket?.on('player:joined', callback);
  }

  onPlayerLeft(callback: (data: any) => void) {
    this.socket?.on('player:left', callback);
  }

  // Matchmaking Events
  joinMatchmaking(playerId: string, gameType: string, mode: string) {
    this.socket?.emit('matchmaking:join', { playerId, gameType, mode });
  }

  onMatchmakingQueued(callback: (data: { position: number }) => void) {
    this.socket?.on('matchmaking:queued', callback);
  }

  onMatchmakingFound(callback: (data: { sessionId: string; opponent: string }) => void) {
    this.socket?.on('matchmaking:found', callback);
  }

  // Leaderboard Events
  onLeaderboardUpdate(callback: (data: any) => void) {
    this.socket?.on('leaderboard:update', callback);
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const wsClient = new WebSocketClient();

