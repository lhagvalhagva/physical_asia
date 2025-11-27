import { apiClient } from '../client';
import type { GameSession, GameResult, ApiResponse } from '../../types/api';

export const gameService = {
  async createSession(gameType: string, mode: string, seasonId?: string): Promise<ApiResponse<GameSession>> {
    return apiClient.post<GameSession>('/api/game/session/create', {
      gameType,
      mode,
      seasonId
    });
  },

  async getSession(sessionId: string): Promise<ApiResponse<GameSession>> {
    return apiClient.get<GameSession>(`/api/game/session/${sessionId}`);
  },

  async submitResult(sessionId: string, score: number, stats: Record<string, any>, rank: number): Promise<ApiResponse<GameResult>> {
    return apiClient.post<GameResult>(`/api/game/session/${sessionId}/result`, {
      score,
      stats,
      rank
    });
  }
};

