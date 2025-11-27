import { apiClient } from '../client';
import type { Player, PlayerStats, ApiResponse } from '../../types/api';

export const playerService = {
  async getProfile(playerId: string): Promise<ApiResponse<Player>> {
    return apiClient.get<Player>(`/api/player/${playerId}`);
  },

  async getStats(playerId: string): Promise<ApiResponse<PlayerStats[]>> {
    return apiClient.get<PlayerStats[]>(`/api/player/${playerId}/stats`);
  },

  async updateProfile(playerId: string, avatar: { imageUrl?: string; frameId?: string }): Promise<ApiResponse<Player>> {
    return apiClient.patch<Player>(`/api/player/${playerId}`, { avatar });
  }
};

