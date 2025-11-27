import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5001';

class WebSocketClient {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Already connected');
      return;
    }

    this.socket = io(WS_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
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

  leaveMatchmaking(gameType: string, mode: string) {
    this.socket?.emit('matchmaking:leave', { gameType, mode });
  }

  onMatchmakingQueued(callback: (data: { position: number }) => void) {
    this.socket?.on('matchmaking:queued', callback);
  }

  onMatchmakingFound(callback: (data: { sessionId: string; opponent: string }) => void) {
    this.socket?.on('matchmaking:found', callback);
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Emit event
  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('Socket not connected');
    }
  }

  // Listen to event
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
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

