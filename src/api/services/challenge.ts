import { apiClient } from '../client';
import type { DailyChallenge, ChallengeProgress, ApiResponse } from '../../types/api';

export const challengeService = {
  async getDaily(): Promise<ApiResponse<DailyChallenge>> {
    return apiClient.get<DailyChallenge>('/api/challenge/daily');
  },

  async getProgress(): Promise<ApiResponse<ChallengeProgress[]>> {
    return apiClient.get<ChallengeProgress[]>('/api/challenge/progress');
  },

  async claimReward(challengeId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`/api/challenge/${challengeId}/claim`);
  }
};

