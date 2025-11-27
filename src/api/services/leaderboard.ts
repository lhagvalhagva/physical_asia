import { apiClient } from '../client';
import type { LeaderboardEntry, ApiResponse } from '../../types/api';

export const leaderboardService = {
  async getGlobal(limit = 100, useRedis = true): Promise<ApiResponse<LeaderboardEntry[]>> {
    return apiClient.get<LeaderboardEntry[]>(`/api/leaderboard/global?limit=${limit}&redis=${useRedis}`);
  },

  async getSeason(seasonId: string, limit = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return apiClient.get<LeaderboardEntry[]>(`/api/leaderboard/season/${seasonId}?limit=${limit}`);
  },

  async getGame(gameType: string, limit = 100): Promise<ApiResponse<LeaderboardEntry[]>> {
    return apiClient.get<LeaderboardEntry[]>(`/api/leaderboard/game/${gameType}?limit=${limit}`);
  },

  async getPlayerRank(playerId: string, useRedis = true): Promise<ApiResponse<{ rank: number }>> {
    return apiClient.get<{ rank: number }>(`/api/leaderboard/player/${playerId}/rank?redis=${useRedis}`);
  },

  async getNearbyPlayers(playerId: string): Promise<ApiResponse<LeaderboardEntry[]>> {
    return apiClient.get<LeaderboardEntry[]>(`/api/leaderboard/player/${playerId}/nearby`);
  }
};

